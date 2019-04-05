import { tryCastSupportSkill, tryTransform2dragon } from '@/battle';
import {
  autoBattleSwitchOff,
  cancelButton,
  closeButton,
  continueButtonRed,
  giveUpButtonBlue,
  giveUpButtonWhite,
  nextText,
  okButton,
  repeatBattleButton,
  repeatWithStaminaButton,
  retryButtonRed,
  startBattleButton,
  tapButton
} from '@/images';
import { store } from '@/store';
import { clickImage, findImageInScreen, tryClickImage } from '@/utils/image';

export function repeatRaid(): void {
  tryClickImage(startBattleButton);
  tryClickImage(autoBattleSwitchOff);
  tryClickImage(retryButtonRed);
  tryClickImage(okButton);
  tryClickImage(closeButton);
  tryClickImage(cancelButton);
  tryClickImage(tapButton);
  tryClickImage(nextText);
  try {
    clickImage(giveUpButtonWhite);
    sleep(500);
    clickImage(giveUpButtonBlue);
    store.currentTask = undefined;
  } catch {
    console.verbose('Give up button not visible');
  }
  try {
    findImageInScreen(continueButtonRed);
    try {
      repeatWithStamina();

      return;
    } catch {
      clickImage(continueButtonRed);

      return;
    }
  } catch {
    console.verbose('Continue button not visible');
  }
  try {
    repeatWithStamina();
  } catch {
    console.verbose('Repeat button not visible');
  }
  tryTransform2dragon();
  tryCastSupportSkill();
}

function repeatWithStamina(): void {
  clickImage(repeatBattleButton);
  sleep(500);
  clickImage(repeatWithStaminaButton);
  sleep(500);
  clickImage(okButton);
}
