"use client";

import { KONAMI_CODE, KEY_LABEL, KEY_NAME, eggCopy } from "@/components/easter-egg/constants";
import OverlayShell from "@/components/easter-egg/OverlayShell";
import { useOverlay } from "@/components/easter-egg/useOverlay";
import Icon from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n";
import type { CSSProperties } from "react";

type MasterCodeProps = {
  locale: Locale;
  onClose: () => void;
  quick?: boolean;
  ghost?: boolean;
  onEnter: () => void;
};

/** Keycap styling class per key: the arrow icons rotate from the base. */
const CAP_CLASS: Record<string, string> = {
  ArrowUp: "u",
  ArrowDown: "d",
  ArrowLeft: "lf",
  ArrowRight: "",
  b: "l",
  a: "l",
};

/**
 * The answer sheet (mockup `#ov-master`, line 4451). It is the only place
 * the sequence is written down, so it stays until closed; the keycaps
 * settle in one by one. It never opens the terminal — the gate is still
 * the sequence itself.
 */
export default function MasterCode({ locale, onClose, onEnter, quick, ghost }: MasterCodeProps) {
  const { visible, containerVisible, leave } = useOverlay(quick);
  const c = eggCopy(locale);
  const ar = locale === "ar";

  const capsLabel = KONAMI_CODE.map((key) => KEY_NAME[key]).join(", ");

  return (
    <OverlayShell
      chip={c.mK}
      title={c.mTitle}
      visible={visible}
      containerVisible={containerVisible}
      closeLabel={c.close}
      onClose={() => leave(onClose)}
      tide
      quick={quick}
      ghost={ghost}
      cardClassName="master"
    >
      <div className="egbd">
        <div className="egring" aria-hidden="true">
          <Icon name="trophy" className="i" />
        </div>

        <h2 className="egt1" dir={ar ? "rtl" : "ltr"}>
          {c.mTitle}
        </h2>
        <p className="egt2" style={{ maxWidth: "38ch" }} dir={ar ? "rtl" : "ltr"}>
          {c.mLead} {c.mSub}
        </p>

        <div className="egcaps" role="img" aria-label={capsLabel}>
          {KONAMI_CODE.map((key, index) => (
            <b
              key={index}
              className={CAP_CLASS[key]}
              style={{ "--i": index } as CSSProperties}
              aria-hidden="true"
            >
              {key.startsWith("Arrow") ? (
                <Icon name="arrowRight" className="i" />
              ) : (
                KEY_LABEL[key]
              )}
            </b>
          ))}
        </div>

        <div className="egshort">
          <span dir={ar ? "rtl" : "ltr"}>{c.mShort}</span>
          <span dir="ltr">
            <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>
          </span>
        </div>

        <div className="egbtns">
          <button type="button" className="egbtn" onClick={() => leave(onEnter)}>
            <span>{c.mBtn}</span>
          </button>
        </div>

        <p className="egach">
          <Icon name="trophy" className="i" />
          <span>{c.mAch}</span>
        </p>
      </div>
    </OverlayShell>
  );
}
