"use client";

import { useEffect } from "react";
import { KONAMI_CODE, eggCopy } from "@/components/easter-egg/constants";
import OverlayShell from "@/components/easter-egg/OverlayShell";
import { useOverlay } from "@/components/easter-egg/useOverlay";
import Icon from "@/components/ui/Icon";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import type { Locale } from "@/lib/i18n";

type SecretTerminalAccessProps = {
  locale: Locale;
  onClose: () => void;
  quick?: boolean;
  ghost?: boolean;
  onTry: () => void;
};

/**
 * The gate (mockup `#ov-prompt`, line 4414): a calm glass card over the
 * tide. It asks for a ten-key sequence and never names the code itself —
 * only the Master Code window reveals the answer.
 */
export default function SecretTerminalAccess({ locale, onClose, onTry, quick, ghost }: SecretTerminalAccessProps) {
  const { visible, containerVisible, leave } = useOverlay();
  const c = eggCopy(locale);

  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  return (
    <OverlayShell
      chip={c.restricted}
      title={c.pTitle}
      visible={visible}
      containerVisible={containerVisible}
      closeLabel={c.close}
      onClose={() => leave(onClose)}
      tide
      quick={quick}
      ghost={ghost}
    >
      <div className="egbd">
        <div className="egring" aria-hidden="true">
          <Icon name="lock" className="i" />
        </div>

        <h2 className="egt1" dir={locale === "ar" ? "rtl" : "ltr"}>
          {c.pTitle}
        </h2>
        <p className="egt2" dir={locale === "ar" ? "rtl" : "ltr"}>
          {c.pSub}
        </p>

        <div className="egslots" aria-hidden="true">
          {KONAMI_CODE.map((key, index) => (
            <i key={index}></i>
          ))}
        </div>

        <div className="egbtns">
          <button type="button" className="egbtn" onClick={onTry}>
            <span>{c.pEnter}</span>
          </button>
          <button type="button" className="egbtn ghost" onClick={() => leave(onClose)}>
            <span>{c.pCancel}</span>
          </button>
        </div>

        <p className="egt3" dir={locale === "ar" ? "rtl" : "ltr"}>
          {c.pHint}
        </p>
      </div>
    </OverlayShell>
  );
}
