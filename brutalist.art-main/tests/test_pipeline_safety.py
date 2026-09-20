"""Offline regressions. Tiny FFmpeg fixtures; no TTS models, browser or captions."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / 'runtime/scripts'
sys.path.insert(0, str(SCRIPTS))
sys.dont_write_bytecode = True
import build_safety as safety
import generate_audio_kokoro as tts
import remotion_scenes as renderer
import shorts


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


compiler = module('slot_compiler', SCRIPTS / 'compile.py')


def execute(args):
    env = dict(os.environ, PYTHONDONTWRITEBYTECODE='1', ART_NO_DRAWTEXT='1')
    return subprocess.run([str(x) for x in args], text=True, capture_output=True, env=env, timeout=90)


class FixtureCase(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='brutalist-test-')
        self.root = Path(self.temp.name)
        self.reel = self.root / 'reel'
        self.reel.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def sheet(self, beats, metadata=None):
        data = {'metadata': metadata or {'slug': 'reel'}, 'beats': beats}
        safety.atomic_json(self.reel / 'beat_sheet.json', data)
        return data

    def feedback(self):
        (self.reel / 'NOTES.md').write_text('Show the failed test and explain the next experiment.')
        return self.sheet([{'beat_id':'B05', 'act':'FEEDBACK',
                            'narration_text':'Professor Bear recommends showing the failed test.'}],
                          {'slug':'reel', 'profile':'fellow-report', 'voice':'af_bella'})

    def approve_fixture(self, sheet):
        """Synthetic test-only sign-offs. Production code never signs approvals."""
        approvals = {}
        for key, value in safety.approval_subjects(self.reel, sheet).items():
            approvals[key] = dict(value, status='approved', reviewed_by='Test reviewer',
                                 reviewer_type='human', reviewed_at='2026-09-07T12:00:00+00:00')
        sheet['metadata']['approvals'] = approvals
        safety.atomic_json(self.reel / 'beat_sheet.json', sheet)
        return sheet

class SafetyTests(FixtureCase):
    def test_malformed_approval_is_a_controlled_failure(self):
        sheet = self.feedback()
        sheet['metadata']['approvals'] = {'voice': 'approved'}
        with self.assertRaises(safety.ApprovalError):
            safety.validate_approvals(self.reel, sheet)

    def test_run_failure_replaces_old_ready_state(self):
        self.feedback()
        safety.atomic_json(self.reel / 'build-state.json', {'status': 'ready'})
        r = execute(['bash', SCRIPTS / 'run.sh', self.reel])
        self.assertNotEqual(r.returncode, 0)
        self.assertEqual(json.loads((self.reel / 'build-state.json').read_text())['status'], 'failed')

    def test_missing_final_checker_is_a_failure(self):
        for name in ('FACTCHECK.md', 'SHOTLIST.md', 'PROMPTS.md'):
            (self.reel / name).write_text('Fixture paperwork')
        original = Path.is_file
        def exists(p):
            return False if p.name == 'beat_lint.py' else original(p)
        with patch.object(Path, 'is_file', exists):
            with self.assertRaisesRegex(safety.BuildError, 'Missing required final gate'):
                compiler.final_preflight(self.reel, {}, 'beat_sheet.json')

    def test_pending_feedback_blocks_dry_run_and_no_gate_flag(self):
        self.feedback()
        r = execute([sys.executable, SCRIPTS/'generate_audio_kokoro.py', self.reel, '--dry-run', '--no-gate'])
        self.assertNotEqual(r.returncode, 0)
        self.assertIn('approval', r.stderr)
        self.assertFalse((self.reel/'mp3').exists())

    def test_approved_legacy_voice_is_used(self):
        self.approve_fixture(self.feedback())
        r = execute([sys.executable, SCRIPTS/'generate_audio_kokoro.py', self.reel, '--dry-run'])
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn('voice=af_bella', r.stdout)

    def test_notes_change_invalidates_approval(self):
        sheet = self.approve_fixture(self.feedback())
        (self.reel/'NOTES.md').write_text('Changed after review')
        with self.assertRaises(safety.ApprovalError):
            safety.validate_approvals(self.reel, sheet)

    def test_narration_change_invalidates_approval(self):
        sheet = self.approve_fixture(self.feedback())
        sheet['beats'][0]['narration_text'] = 'An unreviewed claim'
        with self.assertRaises(safety.ApprovalError):
            safety.validate_approvals(self.reel, sheet)

    def test_voice_change_invalidates_approval(self):
        sheet = self.approve_fixture(self.feedback())
        sheet['metadata']['voice'] = 'am_onyx'
        with self.assertRaises(safety.ApprovalError):
            safety.validate_approvals(self.reel, sheet)

    def test_conflicting_voice_aliases_fail(self):
        with self.assertRaises(safety.BuildError):
            safety.default_voice({'metadata': {'voice':'af_bella','voice_kokoro':'am_onyx'}})

    def test_source_report_is_never_voiced(self):
        self.sheet([{'beat_id':'B04','kind':'source_report','narration_text':'This must not replace the report.'}])
        r = execute([sys.executable, SCRIPTS/'generate_audio_kokoro.py', self.reel, '--dry-run'])
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn('0 beat(s) would generate', r.stdout)

    def test_report_cannot_be_auto_dropped(self):
        beats = [{'beat_id':'B00','actual_duration_s':10},
                 {'beat_id':'B04','act':'REPORT','actual_duration_s':240},
                 {'beat_id':'B09','actual_duration_s':10}]
        self.assertNotIn('B04', shorts.plan_drops(beats, set(), 4.5))

    def test_report_cannot_be_manually_dropped(self):
        self.sheet([{'beat_id':'B04','act':'REPORT','actual_duration_s':240}])
        r = execute([sys.executable,SCRIPTS/'shorts.py',self.reel,'--drop','B04'])
        self.assertNotEqual(r.returncode,0)
        self.assertFalse((self.reel/'short').exists())

    def test_renderer_failure_is_nonzero_and_preserves_sheet(self):
        self.sheet([{'beat_id':'B00','shot':{'remotion':{'pattern':'Test'}}}])
        before = (self.reel/'beat_sheet.json').read_bytes()
        with patch.object(sys,'argv',['remotion_scenes.py',str(self.reel)]), \
             patch.object(renderer,'render_beat',return_value='FAIL: injected'), \
             contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(renderer.main(),2)
        self.assertEqual((self.reel/'beat_sheet.json').read_bytes(),before)

    def test_failed_force_render_preserves_old_media(self):
        (self.reel/'media').mkdir()
        (self.reel/'media/B00.mp4').write_bytes(b'old media fixture')
        with patch.object(renderer.subprocess,'run',return_value=subprocess.CompletedProcess([],1,'','injected')):
            result = renderer.render_beat(self.reel,{'beat_id':'B00','shot':{'remotion':{'pattern':'Test'}}},True)
        self.assertTrue(result.startswith('FAIL:'))
        self.assertEqual((self.reel/'media/B00.mp4').read_bytes(),b'old media fixture')

    def test_duration_extension_failure_is_not_success(self):
        out = self.reel/'candidate.mp4'
        out.write_bytes(b'video fixture')
        with patch.object(renderer.subprocess,'run',return_value=subprocess.CompletedProcess([],1,b'',b'injected')):
            with self.assertRaises(safety.BuildError):
                renderer.extend_clip_to_duration(out,2)

    def test_writes_reject_parent_directory_symlink(self):
        (self.reel/'mp3').symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(safety.BuildError):
            safety.writable_path(self.reel,'mp3/beat-B00.mp3')

    def test_copy_breaks_legacy_file_symlink(self):
        original = self.root/'original'
        original.write_bytes(b'parent')
        link = self.reel/'linked'
        link.symlink_to(original)
        replacement = self.root/'replacement'
        replacement.write_bytes(b'derivative')
        safety.copy_asset(replacement,link,self.reel)
        self.assertEqual(original.read_bytes(),b'parent')
        self.assertEqual(link.read_bytes(),b'derivative')
        self.assertFalse(link.is_symlink())

    def test_duplicate_and_unsafe_ids_fail(self):
        for beats in ([{'beat_id':'../B00'}],[{'beat_id':'B00'},{'beat_id':'B00'}]):
            with self.assertRaises(safety.BuildError):
                safety.validate_project({'beats':beats})


@unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'), 'FFmpeg required')
class MediaTests(FixtureCase):
    def tone(self,path,duration=1,frequency=880):
        path.parent.mkdir(parents=True,exist_ok=True)
        r=execute(['ffmpeg','-y','-v','error','-f','lavfi','-i',f'sine=frequency={frequency}:duration={duration}',path])
        self.assertEqual(r.returncode,0,r.stderr)

    def video(self,path,duration=1,frequency=None,square=False):
        path.parent.mkdir(parents=True,exist_ok=True)
        size = '90x90' if square else '160x90'
        visual=f'color=c=white:s={size}:r=24:d={duration},drawbox=x=16:y=9:w=58:h=72:color=black:t=fill'
        if not square:
            visual=f'color=c=white:s={size}:r=24:d={duration},drawbox=x=16:y=9:w=128:h=72:color=black:t=fill'
        args=['ffmpeg','-y','-v','error','-f','lavfi','-i',visual]
        if frequency:
            args += ['-f','lavfi','-i',f'sine=frequency={frequency}:duration={duration}','-c:a','aac','-shortest']
        args += ['-c:v','libx264','-pix_fmt','yuv420p',path]
        r=execute(args)
        self.assertEqual(r.returncode,0,r.stderr)

    def compile(self,review=True,*extra):
        args=[sys.executable,SCRIPTS/'compile.py',self.reel,'--height','90','--out',self.root/'exports']
        if review: args += ['--review']
        return execute(args+list(extra))

    def paperwork(self):
        for name in ('FACTCHECK.md','SHOTLIST.md','PROMPTS.md'):
            (self.reel/name).write_text('Test fixture evidence/work order. No external claims.')

    def single_report(self):
        self.video(self.reel/'media/B04.mp4',duration=1.05,frequency=440,square=True)
        self.sheet([{'beat_id':'B04','act':'REPORT','estimated_duration_s':0.1,
                     'narration_text':'Not a replacement voiceover','shot':{'type':'USER-CAPTURE','source':'user'}}])

    def test_report_sound_duration_and_framing_survive(self):
        self.single_report()
        self.paperwork()
        src=self.reel/'media/B04.mp4'
        before=safety.file_digest(src)
        r=self.compile(False)
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        out=self.root/'exports/reel.mp4'
        compiler.require_audible(out,'test report')
        self.assertAlmostEqual(compiler.probe_dur(out),compiler.probe_dur(src),delta=1/24+0.03)
        self.assertEqual(safety.file_digest(src),before)
        from PIL import Image
        png=self.root/'frame.png'
        r=execute(['ffmpeg','-y','-v','error','-ss','0.5','-i',out,'-frames:v','1',png])
        self.assertEqual(r.returncode,0,r.stderr)
        with Image.open(png) as im:
            edge=im.convert('RGB').getpixel((0,45))
            self.assertTrue(all(abs(a-b)<10 for a,b in zip(edge,compiler.CREAM_RGB)),edge)
        proof=json.loads(out.with_suffix('.verified.json').read_text())
        self.assertEqual(proof['sha256'],safety.file_digest(out))
        self.assertEqual(proof['status'],'ready')

    def test_report_between_narration_beats_keeps_clock_and_sound(self):
        self.single_report()
        report=json.loads((self.reel/'beat_sheet.json').read_text())['beats'][0]
        beats=[]
        for bid in ('B00','B08'):
            self.video(self.reel/f'media/{bid}.mp4')
            self.tone(self.reel/f'audio/{bid}.wav',frequency=880)
            beats.append({'beat_id':bid,'actual_duration_s':1,'audio_file':f'audio/{bid}.wav',
                          'narration_text':'Fixture narration','shot':{'type':'USER-CAPTURE'}})
        self.sheet([beats[0],report,beats[1]])
        self.paperwork()
        r=self.compile(False)
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        out=self.root/'exports/reel.mp4'
        import numpy as np
        raw=subprocess.run(['ffmpeg','-v','error','-ss','1.2','-t','0.5','-i',str(out),
                            '-vn','-ac','1','-ar','8000','-f','f32le','-'],capture_output=True,check=True).stdout
        samples=np.frombuffer(raw,dtype='<f4')
        peak=np.fft.rfftfreq(len(samples),1/8000)[np.argmax(abs(np.fft.rfft(samples)))]
        self.assertAlmostEqual(peak,440,delta=4)

    def test_missing_narration_blocks_instead_of_muting_everything(self):
        self.video(self.reel/'media/B00.mp4')
        self.sheet([{'beat_id':'B00','actual_duration_s':1,'narration_text':'Missing audio'}])
        r=self.compile(True)
        self.assertNotEqual(r.returncode,0)
        self.assertIn('missing required audio',r.stderr)
        self.assertFalse((self.reel/'reel-slate.mp4').exists())

    def test_missing_report_sound_blocks(self):
        self.video(self.reel/'media/B04.mp4')
        self.sheet([{'beat_id':'B04','act':'REPORT','estimated_duration_s':1}])
        r=self.compile(True)
        self.assertNotEqual(r.returncode,0)
        self.assertIn('no audio stream',r.stderr)

    def test_declared_silence_is_per_beat(self):
        self.video(self.reel/'media/B00.mp4')
        self.sheet([{'beat_id':'B00','actual_duration_s':1,'audio_policy':'silence'}])
        r=self.compile(True)
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)

    def test_global_audio_cannot_override_source_report(self):
        self.single_report()
        self.tone(self.root/'replacement.wav')
        r=self.compile(True,'--audio',str(self.root/'replacement.wav'))
        self.assertNotEqual(r.returncode,0)
        self.assertIn('cannot replace',r.stderr)

    def test_final_paperwork_cannot_be_bypassed(self):
        self.single_report()
        r=self.compile(False)
        self.assertNotEqual(r.returncode,0)
        self.assertIn('GATE F',r.stderr)
        self.assertFalse((self.root/'exports/reel.mp4').exists())

    def test_pending_notes_block_direct_final(self):
        self.feedback()
        r=self.compile(False)
        self.assertNotEqual(r.returncode,0)
        self.assertIn('approval',r.stderr)

    def test_zero_frame_qc_fails_and_replaces_stale_verdict(self):
        self.video(self.root/'tiny.mp4')
        self.sheet([{'beat_id':'B00','actual_duration_s':1000}])
        (self.reel/'_qc').mkdir()
        (self.reel/'_qc/REPORT.md').write_text('Old clean report')
        r=execute([sys.executable,ROOT/'runtime/qc/final_frame_check.py',self.reel,'--mp4',self.root/'tiny.mp4'])
        self.assertNotEqual(r.returncode,0)
        self.assertIn('FAILED',(self.reel/'_qc/REPORT.md').read_text())

    def test_final_qc_failure_preserves_previous_final(self):
        self.video(self.reel/'media/B00.mp4')
        self.tone(self.reel/'audio/B00.wav')
        self.sheet([{'beat_id':'B00','actual_duration_s':1,'audio_file':'audio/B00.wav'}])
        self.paperwork()
        (self.root/'exports').mkdir()
        old=self.root/'exports/reel.mp4'
        old.write_bytes(b'previous verified final fixture')
        original_sh=compiler.sh
        def fail_gate(args,**kwargs):
            if any(str(x).endswith('final_frame_check.py') for x in args):
                raise safety.BuildError('injected required gate failure')
            return original_sh(args,**kwargs)
        with patch.object(compiler,'sh',side_effect=fail_gate), patch.object(sys,'argv',[
                'compile.py',str(self.reel),'--height','90','--out',str(self.root/'exports')]), \
                contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(compiler.main(),2)
        self.assertEqual(old.read_bytes(),b'previous verified final fixture')
        self.assertEqual(json.loads((self.reel/'build-state.json').read_text())['status'],'failed')

    def test_tts_writer_breaks_legacy_short_audio_link(self):
        parent=self.root/'parent.mp3'
        self.tone(parent)
        before=parent.read_bytes()
        link=self.reel/'beat-B00.mp3'
        link.symlink_to(parent)
        tts.write_mp3([0.0]*24000,24000,link)
        self.assertEqual(parent.read_bytes(),before)
        self.assertFalse(link.is_symlink())

    def test_vertical_keeps_report_and_does_not_modify_parent(self):
        self.single_report()
        before={p.relative_to(self.reel):safety.file_digest(p) for p in self.reel.rglob('*') if p.is_file()}
        r=execute([sys.executable,SCRIPTS/'shorts.py',self.reel,'--vertical'])
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        for p,h in before.items(): self.assertEqual(safety.file_digest(self.reel/p),h)
        sheet=json.loads((self.reel/'vertical/beat_sheet.json').read_text())
        self.assertEqual([b['beat_id'] for b in sheet['beats']],['B04'])
        self.assertEqual(sheet['metadata']['kind'],'vertical')
        self.assertFalse((self.reel/'vertical/media/B04.mp4').is_symlink())
        self.assertEqual(safety.file_digest(self.reel/'vertical/media/B04.mp4'),safety.file_digest(self.reel/'media/B04.mp4'))

    def test_short_copies_audio_and_prints_only_outro_command(self):
        self.tone(self.reel/'audio/custom-name.wav')
        beats=[{'beat_id':'B00','actual_duration_s':1,'narration_text':'Intro','audio_file':'audio/custom-name.wav'},
               {'beat_id':'B01','actual_duration_s':1,'narration_text':'Middle'},
               {'beat_id':'B02','actual_duration_s':1,'narration_text':'Outro'}]
        for b in beats: self.video(self.reel/f"media/{b['beat_id']}.mp4")
        self.sheet(beats)
        before=safety.file_digest(self.reel/'audio/custom-name.wav')
        r=execute([sys.executable,SCRIPTS/'shorts.py',self.reel,'--drop','B01','--no-endcard'])
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        self.assertIn('--only B02',r.stdout)
        copied=self.reel/'short/mp3/beat-B00.mp3'
        self.assertFalse(copied.is_symlink())
        tts.write_mp3([0.0]*24000,24000,copied)
        self.assertEqual(safety.file_digest(self.reel/'audio/custom-name.wav'),before)

    def test_missing_portrait_blocks_and_quarantines_stale_slot(self):
        self.sheet([{'beat_id':'B00','actual_duration_s':1,'narration_text':'Intro',
                     'shot':{'type':'REMOTION','remotion':{'pattern':'NoPortraitFixture'}}}])
        stale=self.reel/'short/media/B00.mp4'
        stale.parent.mkdir(parents=True)
        stale.write_bytes(b'stale landscape fixture')
        r=execute([sys.executable,SCRIPTS/'shorts.py',self.reel,'--no-endcard'])
        self.assertNotEqual(r.returncode,0)
        self.assertFalse(stale.exists())
        self.assertTrue(list((self.reel/'short/_stale').iterdir()))

    def test_pantry_preserves_report_sound(self):
        self.video(self.reel/'pantry/B04-report.mp4',frequency=440,square=True)
        self.sheet([{'beat_id':'B04','act':'REPORT','actual_duration_s':1}])
        r=execute([sys.executable,SCRIPTS/'pantry.py',self.reel])
        self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        compiler.require_audible(self.reel/'media/B04.mp4','pantry report')

    def test_pantry_accepts_pcm_mov_report(self):
        self.video(self.root / 'source.mp4', frequency=440)
        (self.reel / 'pantry').mkdir()
        r = execute(['ffmpeg', '-y', '-v', 'error', '-i', self.root / 'source.mp4',
                     '-c:v', 'copy', '-c:a', 'pcm_s16le', self.reel / 'pantry/B04-report.mov'])
        self.assertEqual(r.returncode, 0, r.stderr)
        self.sheet([{'beat_id': 'B04', 'kind': 'source_report'}])
        r = execute([sys.executable, SCRIPTS / 'pantry.py', self.reel])
        self.assertEqual(r.returncode, 0, r.stderr)
        compiler.require_audible(self.reel / 'media/B04.mp4', 'MOV report')

    def test_empty_frame_is_not_clean(self):
        from PIL import Image
        Image.new('RGB', (160, 90), 'white').save(self.reel / 'empty.png')
        r = execute([sys.executable, ROOT / 'runtime/qc/final_frame_check.py', '--frames-dir', self.reel])
        self.assertEqual(r.returncode, 2, r.stdout + r.stderr)
        self.assertIn('empty-frame', (self.reel / 'REPORT.md').read_text())

    def test_source_edit_during_final_blocks_promotion(self):
        self.single_report()
        self.paperwork()
        original_sh = compiler.sh
        def mutate_after_gate(args, **kwargs):
            result = original_sh(args, **kwargs)
            if any(str(x).endswith('final_frame_check.py') for x in args):
                with (self.reel / 'media/B04.mp4').open('ab') as f:
                    f.write(b'changed input fixture')
            return result
        with patch.object(compiler, 'sh', side_effect=mutate_after_gate), \
             patch.object(sys, 'argv', ['compile.py', str(self.reel), '--height', '90',
                                       '--out', str(self.root / 'exports')]), \
             contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(compiler.main(), 2)
        self.assertFalse((self.root / 'exports/reel.mp4').exists())
        self.assertIn('changed during rendering', (self.reel / 'build-state.json').read_text())

    def test_short_recut_breaks_legacy_media_link(self):
        self.video(self.reel / 'media/B00.mp4')
        self.tone(self.reel / 'mp3/beat-B00.mp3')
        self.sheet([{'beat_id': 'B00', 'actual_duration_s': 1, 'narration_text': 'Fixture'}])
        before = safety.file_digest(self.reel / 'media/B00.mp4')
        link = self.reel / 'short/media/B00-916.mp4'
        link.parent.mkdir(parents=True)
        link.symlink_to(self.reel / 'media/B00.mp4')
        r = execute([sys.executable, SCRIPTS / 'shorts.py', self.reel, '--recut', '--no-endcard'])
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertFalse(link.is_symlink())
        self.assertEqual(safety.file_digest(self.reel / 'media/B00.mp4'), before)


if __name__ == '__main__':
    unittest.main()
