"""Shared fail-closed contracts. No generation, approval signing or captions."""
import argparse
from datetime import datetime
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import tempfile


class BuildError(ValueError):
    pass


class ApprovalError(BuildError):
    pass


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False,
                                     separators=(',', ':')).encode()).hexdigest()


def file_digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def atomic_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix='.' + path.name + '.', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as f:
            json.dump(value, f, indent=2, ensure_ascii=False, allow_nan=False)
            f.write('\n')
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)  # replaces a symlink; never writes through it
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def writable_path(root, relative):
    """Reject symlinked parent directories; file links are replaced atomically."""
    root = Path(root).resolve()
    path = root / relative
    if path.is_absolute() and not path.parent.resolve().is_relative_to(root):
        raise BuildError(f'Output escapes project: {path}')
    return path


def atomic_text(path, text):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix='.' + path.name + '.', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as f:
            f.write(text)
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def copy_asset(source, destination, root):
    destination = writable_path(root, Path(destination).relative_to(root))
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix='.asset-', dir=destination.parent)
    os.close(fd)
    try:
        shutil.copy2(source, tmp)
        os.replace(tmp, destination)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def is_fellows(sheet):
    md = sheet.get('metadata') or {}
    return (any(str(md.get(k, '')).lower() in ('fellows', 'fellow-report', 'fellow_report')
                for k in ('profile', 'skill', 'kind'))
            or md.get('voice_policy') == 'persistent-fellow-selected')


def is_source_report(beat, sheet=None):
    shot = beat.get('shot') or {}
    return (str(beat.get('kind', '')).lower() == 'source_report'
            or str(shot.get('type', '')).upper() == 'SOURCE_REPORT'
            or str(beat.get('act', '')).upper().replace(' ', '_') in ('REPORT', 'THE_REPORT', 'FELLOW_REPORT')
            or (beat.get('clock') == 'source' and beat.get('audio_policy') == 'preserve')
            or (sheet is not None and is_fellows(sheet) and beat.get('beat_id') == 'B04'))


def intentional_silence(beat):
    return (beat.get('audio_policy') == 'silence' or beat.get('silent') is True
            or (beat.get('card') or {}).get('silent') is True)


def feedback_beats(sheet):
    return [b for b in sheet.get('beats', [])
            if (b.get('requires_approval') == 'professor_notes'
                or str(b.get('act', '')).upper().replace(' ', '_') in
                   ('FEEDBACK', 'PROFESSOR_BEAR_NOTES', "PROFESSOR_BEAR'S_NOTES")
                or (is_fellows(sheet) and b.get('beat_id') in ('B05', 'B06')))]


def default_voice(sheet):
    md = sheet.get('metadata') or {}
    legacy, current = md.get('voice'), md.get('voice_kokoro')
    if legacy and current and legacy != current:
        raise BuildError('metadata.voice and voice_kokoro disagree; choose one persistent voice')
    return current or legacy or 'am_onyx'


def approval_subjects(folder, sheet):
    notes = Path(folder) / 'NOTES.md'
    result = {}
    if is_fellows(sheet):
        result['voice'] = {'subject_sha256': digest({'engine': 'kokoro', 'voice': default_voice(sheet)})}
    feedback = feedback_beats(sheet)
    if feedback:
        result['professor_notes'] = {
            'notes_sha256': file_digest(notes) if notes.is_file() else None,
            'narration_sha256': digest([{'beat_id': b['beat_id'],
                'narration_text': b.get('narration_text', ''),
                'voice': b.get('voice') or default_voice(sheet)} for b in feedback])}
    return result


def validate_approvals(folder, sheet):
    md = sheet.get('metadata') or {}
    if is_fellows(sheet):
        if not (md.get('voice') or md.get('voice_kokoro')):
            raise ApprovalError('Choose the fellow narrator explicitly before approving the voice')
        for b in sheet['beats']:
            if not is_source_report(b, sheet) and (
                    (b.get('voice') and b['voice'] != default_voice(sheet))
                    or str(b.get('engine', md.get('engine', 'kokoro'))).lower() != 'kokoro'):
                raise ApprovalError('Fellows narration must use the approved persistent Kokoro voice')
    approvals = md.get('approvals') or {}
    if not isinstance(approvals, dict):
        raise ApprovalError('metadata.approvals must be an object of human review records')
    for name, expected in approval_subjects(folder, sheet).items():
        record = approvals.get(name) or {}
        if not isinstance(record, dict):
            raise ApprovalError(f'GATE {name}: approval must be a human review record')
        try:
            date = datetime.fromisoformat(str(record.get('reviewed_at', '')).replace('Z', '+00:00'))
            dated = date.utcoffset() is not None
        except ValueError:
            dated = False
        if (record.get('status') != 'approved' or record.get('reviewer_type') != 'human'
                or not str(record.get('reviewed_by', '')).strip() or not dated
                or any(v is None or record.get(k) != v for k, v in expected.items())):
            raise ApprovalError(f'GATE {name}: missing, pending or stale human approval; '
                                'inspect build_safety.py <reel> --fingerprints')
        if name == 'professor_notes' and not (Path(folder) / 'NOTES.md').read_text().strip():
            raise ApprovalError('GATE professor_notes: NOTES.md is empty')


def validate_project(sheet):
    if not isinstance(sheet, dict) or not isinstance(sheet.get('metadata', {}), dict):
        raise BuildError('Beat sheet and metadata must be objects')
    beats = sheet.get('beats')
    if not isinstance(beats, list) or not beats:
        raise BuildError('beat_sheet.json needs a nonempty beats list')
    seen = set()
    for b in beats:
        if not isinstance(b, dict) or not isinstance(b.get('shot', {}), dict):
            raise BuildError('Every beat and shot must be an object')
        bid = b.get('beat_id', '')
        if not isinstance(bid, str) or not re.fullmatch(r'[A-Z][A-Z0-9_]*', bid) or bid in seen:
            raise BuildError(f'Unsafe or duplicate beat_id: {bid!r}')
        seen.add(bid)
        if is_source_report(b, sheet) and (b.get('shot') or {}).get('remotion'):
            raise BuildError(f'{bid}: source reports cannot also be generated Remotion scenes')
    slug = (sheet.get('metadata') or {}).get('slug', 'reel')
    if not isinstance(slug, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*', slug):
        raise BuildError('metadata.slug must be a filename, not a path')
    default_voice(sheet)


def record_failure(folder, error, status='failed'):
    """Best effort: state-writing failure must not hide the actual build error."""
    try:
        atomic_json(writable_path(folder, 'build-state.json'), {
            'status': status, 'error': str(error), 'at': datetime.now().astimezone().isoformat()})
    except (BuildError, OSError):
        pass


def positive_duration(value, label):
    try:
        value = float(value)
    except (TypeError, ValueError):
        raise BuildError(f'{label}: missing or invalid duration')
    if not math.isfinite(value) or value <= 0:
        raise BuildError(f'{label}: duration must be positive and finite')
    return value


def require_paperwork(folder):
    for name in ('FACTCHECK.md', 'SHOTLIST.md', 'PROMPTS.md'):
        p = Path(folder) / name
        if not p.is_file() or not p.read_text().strip():
            raise BuildError(f'GATE F: missing or empty {name}; review is allowed, final is blocked')


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('reel', type=Path)
    ap.add_argument('--fingerprints', action='store_true', help='print subjects for human review; never signs')
    a = ap.parse_args()
    sheet = json.loads((a.reel / 'beat_sheet.json').read_text())
    validate_project(sheet)
    if a.fingerprints:
        print(json.dumps(approval_subjects(a.reel, sheet), indent=2))
    else:
        validate_approvals(a.reel, sheet)


if __name__ == '__main__':
    try:
        main()
    except (BuildError, OSError, KeyError, TypeError) as exc:
        raise SystemExit(f'[safety] REFUSED: {exc}')
