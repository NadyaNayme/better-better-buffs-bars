export type AlertEntry = {
  key: string;
  label: string;
  filename: string;
};

export const alertsMap: AlertEntry[] = [
    // Buff Alerts
    { key: 'Animate Dead', filename: 'Animate Dead.mp3', label: 'Animate Dead expired' },
    { key: 'Antifire', filename: 'Antifire.mp3', label: 'Antifire expired' },
    { key: 'Antipoison', filename: 'AntiPoison.mp3', label: 'Antipoison expired' },
    { key: 'Aura', filename: 'Aura.mp3', label: 'Aura expired' },
    { key: 'Cannon Decay', filename: 'Cannon Decay.mp3', label: 'Cannon Decay' },
    { key: 'CantDrink', filename: 'Cant Drink.mp3', label: 'Can\'t Drink Potion' },
    { key: 'Darkness', filename: 'Darkness.mp3', label: 'Darkness expired' },
    { key: 'Divine Charge', filename: 'Divine Charge.mp3', label: 'Out of Divine Charges' },
    { key: 'Ectoplasm', filename: 'Ectoplasm.mp3', label: 'Out of Ectoplasm' },
    { key: 'Familiar Summoned', filename: 'Familiar.mp3', label: 'Familiar Summoned' },
    { key: 'God Book', filename: 'God Book.mp3', label: 'God Book' },
    { key: 'Health (Low)', filename: 'Health Low.mp3', label: 'Health (Low)' },
    { key: 'Relentless', filename: 'ImRelentless.mp3', label: 'Relentless Procced' },
    { key: 'Incense Sticks (Kwuarm)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Kwuarm)' },
    { key: 'Incense Sticks (Lantadyme)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Lantadyme)' },
    { key: 'Incense Sticks (Fellstalk)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Fellstalk)' },
    { key: 'Incense Sticks (Dwarf Weed)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Dwarf Weed)' },
    { key: 'Incense Sticks (Ranarr)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Ranarr)' },
    { key: 'No Runes', filename: 'NoRunes.mp3', label: 'Out of runes' },
    { key: 'Overload', filename: 'Overload.mp3', label: 'Overload expired' },
    { key: 'Supreme Overload', filename: 'Overload.mp3', label: 'Supreme Overload expired' },
    { key: 'Elder Overload', filename: 'Overload.mp3', label: 'Elder Overload expired' },
    { key: 'Payment', filename: 'Payment.mp3', label: 'Ability needs additional payment' },
    { key: 'Prayer Renewal', filename: 'Prayer Renewal.mp3', label: 'Prayer Renewal expired' },
    { key: 'Runes', filename: 'Runes.mp3', label: 'Runes' },
    { key: 'Scream', filename: 'Scream.mp3', label: 'Scream' },
    { key: 'Sip Prayer', filename: 'Sip Prayer.mp3', label: 'Sip Prayer' },
    { key: 'Strike Again', filename: 'Strike Again.mp3', label: 'Strike Again' },
    { key: 'Summoning Points', filename: 'Summoning Points.mp3', label: 'Out of Summoning Points' },
    { key: 'Weapon Poison', filename: 'Weapon Poison.mp3', label: 'Weapon Poison expired' },
    { key: 'Prayer (Empty)', filename: 'Prayer Empty.mp3', label: 'Out of prayer points' },
    { key: 'Prayer (Low)', filename: 'Prayer Low.mp3', label: 'Prayer points are low' },

    // Chat Alerts found below this point

    // Nakatra
    { key: 'Prepare for death', filename: 'Nakatra Prepare.mp3', label: 'Nakatra - Immersive - Prepare for death...' },
    { key: 'I\'m afraid this is where your story ends', filename: 'Nakatra Story Ends.mp3', label: 'Nakatra - Immersive - ...where your story ends' },
    { key: 'The soulfire erases all', filename: 'Nakatra Soulfire.mp3', label: 'Nakatra - Immersive - The soulfire erases all' },
    { key: 'Be obliterated!', filename: 'Nakatra Be Obliterated.mp3', label: 'Nakatra - Immersive - Be obliterated!' },
    { key: 'The Sanctum is mine to control', filename: 'Nakatra Control.mp3', label: 'Nakatra - Immersive - The Sanctum is mine to control' },
    { key: 'Face judgement foul wretch', filename: 'Nakatra Face Judgment.mp3', label: 'Nakatra - Immersive - Face judgement foul wretch' },
    { key: 'Feel the power beneath your feet', filename: 'Nakatra Feel the Power.mp3', label: 'Nakatra - Immersive - Feel the power beneath your feet' },
    { key: 'The Sanctum will protect me while I only grow stronger', filename: 'Nakatra Protect Me.mp3', label: 'Nakatra - Immersive - The Sanctum will protect me while I only grow stronger' },
    { key: 'Nefthys', filename: 'Nakatra Nefthys.mp3', label: 'Nakatra - Immersive - Nefthys!' },
    { key: 'Be healed', filename: 'Nakatra Nefthys Heal.mp3', label: 'Nakatra - Immersive - Be healed!' },
    { key: 'Nefthys, be restored', filename: 'Nakatra Nefthys Heal.mp3', label: 'Nakatra - Immersive - Nefthys, be restored!' },
    { key: 'We are eternal', filename: 'Nakatra Nefthys Heal.mp3', label: 'Nakatra - Immersive - We are eternal!' },
    { key: 'Suffer the full power of the Sanctum', filename: 'Nakatra Full Power.mp3', label: 'Nakatra - Immersive - Suffer the full power of the Sanctum' },
    { key: 'The Devourer will consume your soul', filename: 'Nakatra Consume.mp3', label: 'Nakatra - Immersive - The Devourer will consume your soul' },
    { key: 'You would have made a fine addition to our order', filename: 'Nakatra Fine Addition.mp3', label: 'Nakatra - Immersive - You would have made a fine addition to our order' },
    { key: 'YOUR SOUL IS MINE', filename: 'Nakatra Devourer.mp3', label: 'Nakatra - Immersive - YOUR SOUL IS MINE!' },
    { key: 'Impossible...', filename: 'Nakatra Impossible.mp3', label: 'Nakatra - Immersive - Impossible...' },
    { key: 'WHAT ARE YOU', filename: 'Nakatra What Are You.mp3', label: 'Nakatra - Immersive - WHAT ARE YOU?' },
    { key: 'Your death is inevitable', filename: 'Nakatra Inevitable.mp3', label: 'Nakatra - Immersive - Your death is inevitable' },
    { key: 'Arghh', filename: 'Nakatra Scream.mp3', label: 'Nakatra - Immersive - Arghh' },
    { key: 'You cannot stop me', filename: 'Nakatra Cannot Stop Me.mp3', label: 'Nakatra - Immersive - You cannot stop me!' },
    { key: 'Enough!', filename: 'Nakatra Enough.mp3', label: 'Nakatra - Immersive - Enough!' },
    { key: 'This is over!', filename: 'Nakatra Over.mp3', label: 'Nakatra - Immersive - This is over!' },
    { key: 'For... the order', filename: 'Nakatra Defeat.mp3', label: 'Nakatra - Immersive - For... the order' },

    // Telos
    { key: 'Your anima will return to the source', filename: 'Telos Tendril Attack.wav', label: 'Telos - Immersive - Your anima will return to the source'},
    { key: 'Gielinor, give me strength!', filename: 'Telos Uppercut.wav', label: 'Telos - Immersive - Geilinor, give me strength!'},
    { key: 'Hold still, invader', filename: 'Telos Stun.wav', label: 'Telos - Immersive - Hold still, invader'},
    { key: 'SO. MUCH. POWER!', filename: 'Telos So Much Power.wav', label: 'Telos - Immersive - SO. MUCH. POWER!'},
    { key: 'Let the anima consume you!', filename: 'Telos Weak Anima Bomb.wav', label: 'Telos - Immersive - Let the anima consume you!'},
    { key: 'You dare to defy me?', filename: 'Telos Instakill.wav', label: 'Telos - Immersive - You dare to defy me?'},
    { key: 'You dare to use my power against me?', filename: 'Telos Font.wav', label: 'Telos - Immersive - Dare to use my power against me'},
];