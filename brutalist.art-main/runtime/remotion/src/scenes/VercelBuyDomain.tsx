import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

// B05 — THE THESIS. buy_domain schema as a form: required PII fields light up,
// real-money price tag, expectedPrice shown as price-check NOT a confirm button.
// NEVER completes a purchase. Spark: "Price-check ≠ confirm."

export const vercelBuyDomainSchema = z.object({
  sparkLine: z.string().default('Price-check ≠ confirm.'),
});
export type VercelBuyDomainProps = z.infer<typeof vercelBuyDomainSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const MONO  = CLAUDE_FONT.mono;

const WARN_BG  = '#FEF2F0';
const WARN_BD  = CLAUDE.SPARK;
const FIELD_ACTIVE_BG  = '#FFF5F2';
const FIELD_ACTIVE_BD  = '#D97757';
const FIELD_NORMAL_BD  = '#E5E2D9';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


interface FormFieldProps {
  label: string;
  value: string;
  active: boolean;
  opacity: number;
  ty: number;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, active, opacity, ty }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    opacity,
    transform: `translateY(${ty}px)`,
  }}>
    <div style={{
      fontFamily: SANS,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
      color: active ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
    }}>
      {label} <span style={{ color: CLAUDE.SPARK }}>*</span>
    </div>
    <div style={{
      background: active ? FIELD_ACTIVE_BG : CLAUDE.CARD,
      border: `1.5px solid ${active ? FIELD_ACTIVE_BD : FIELD_NORMAL_BD}`,
      borderRadius: 8,
      padding: '8px 12px',
      fontFamily: MONO,
      fontSize: 13,
      color: active ? CLAUDE.INK : CLAUDE.GHOST,
    }}>
      {active ? value : '—'}
    </div>
  </div>
);

export const VercelBuyDomain: React.FC<VercelBuyDomainProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const eyebrowIn   = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const titleIn     = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const toolNameIn  = spring({ frame: frame - 14, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const f1In        = spring({ frame: frame - 22, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const f2In        = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const f3In        = spring({ frame: frame - 36, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const f4In        = spring({ frame: frame - 42, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const f5In        = spring({ frame: frame - 48, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const f6In        = spring({ frame: frame - 54, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const priceIn     = spring({ frame: frame - 64, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const expectedIn  = spring({ frame: frame - 76, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const noteIn      = spring({ frame: frame - 92, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn     = spring({ frame: frame - 106, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const fieldIns = [f1In, f2In, f3In, f4In, f5In, f6In];

  const fields: Array<{ label: string; value: string }> = [
    { label: 'domain_name', value: 'example.com' },
    { label: 'registrant.first_name', value: 'Jane' },
    { label: 'registrant.last_name', value: 'Smith' },
    { label: 'registrant.address', value: '123 Main Street' },
    { label: 'registrant.phone', value: '+1 555 867 5309' },
    { label: 'registrant.email', value: 'jane@example.com' },
  ];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.065,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(eyebrowIn, 0, 1),
      }}>
        BUY_DOMAIN · THE THESIS
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.115,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 42,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        One Tool. Real Money. Your Legal Name.
      </div>

      {/* Tool name badge */}
      <div style={{
        position: 'absolute',
        top: height * 0.225,
        left: width * 0.07,
        opacity: clamp(toolNameIn, 0, 1),
        transform: `translateY(${(1 - clamp(toolNameIn, 0, 1)) * 8}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          background: WARN_BG,
          border: `2px solid ${WARN_BD}`,
          borderRadius: 10,
          padding: '8px 20px',
          fontFamily: MONO,
          fontSize: 20,
          fontWeight: 700,
          color: CLAUDE.SEND,
          letterSpacing: 1,
        }}>
          buy_domain
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 13,
          color: CLAUDE.INK_SOFT,
        }}>
          vercel.com/docs/tools-reference — live schema
        </div>
      </div>

      {/* Form fields — two columns */}
      <div style={{
        position: 'absolute',
        top: height * 0.305,
        left: width * 0.07,
        right: width * 0.07,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '14px 20px',
      }}>
        {fields.map((f, i) => (
          <FormField
            key={i}
            label={f.label}
            value={f.value}
            active={clamp(fieldIns[i], 0, 1) > 0.5}
            opacity={clamp(fieldIns[i], 0, 1)}
            ty={(1 - clamp(fieldIns[i], 0, 1)) * 14}
          />
        ))}
      </div>

      {/* Price tag + expectedPrice note side by side */}
      <div style={{
        position: 'absolute',
        top: height * 0.635,
        left: width * 0.07,
        right: width * 0.07,
        display: 'flex',
        gap: 24,
        alignItems: 'stretch',
      }}>
        {/* Price tag */}
        <div style={{
          background: WARN_BG,
          border: `2px solid ${WARN_BD}`,
          borderRadius: 16,
          padding: '22px 28px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          opacity: clamp(priceIn, 0, 1),
          transform: `translateY(${(1 - clamp(priceIn, 0, 1)) * 14}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.SEND, textTransform: 'uppercase' as const }}>
            REAL-MONEY PURCHASE
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 700, color: CLAUDE.INK }}>
            $12.99 / year
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>
            Irreversible. Charged to your card on file.
          </div>
        </div>

        {/* expectedPrice clarification */}
        <div style={{
          background: CLAUDE.CARD,
          border: `2px solid ${CLAUDE.BORDER}`,
          borderRadius: 16,
          padding: '22px 28px',
          flex: 1.4,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          opacity: clamp(expectedIn, 0, 1),
          transform: `translateY(${(1 - clamp(expectedIn, 0, 1)) * 14}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
            EXPECTED_PRICE (optional field)
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: CLAUDE.INK }}>
            Price-check input — not a confirm step
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            Guards against surprise cost. The tool does NOT stop and ask "are you sure?" — nothing in the protocol makes it.
          </div>
        </div>
      </div>

      {/* Note */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.135,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(noteIn, 0, 1),
      }}>
        One sentence from you → Claude registers a domain in your legal name, with your home address, and charges your card.
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.065,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
