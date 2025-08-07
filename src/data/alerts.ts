export type AlertEntry = {
  key: string;
  label: string;
  filename: string;
  category: string[] | null;
};

export const alertsMap: AlertEntry[] = [
    // Buff Alerts
    { key: 'Animate Dead', filename: 'Animate Dead.mp3', label: 'Animate Dead expired', category: ['Informative'] },
    { key: 'Antifire', filename: 'Antifire.mp3', label: 'Antifire expired', category: ['Informative'] },
    { key: 'Antipoison', filename: 'AntiPoison.mp3', label: 'Antipoison expired', category: ['Informative'] },
    { key: 'Aura', filename: 'Aura.mp3', label: 'Aura expired', category: ['Informative'] },
    { key: 'Cannon Decay', filename: 'Cannon Decay.mp3', label: 'Cannon Decay', category: ['Informative'] },
    { key: 'CantDrink', filename: 'Cant Drink.mp3', label: 'Can\'t Drink Potion', category: ['Informative'] },
    { key: 'Darkness', filename: 'Darkness.mp3', label: 'Darkness expired', category: ['Informative'] },
    { key: 'Divine Charge', filename: 'Divine Charge.mp3', label: 'Out of Divine Charges', category: ['Informative'] },
    { key: 'Ectoplasm', filename: 'Ectoplasm.mp3', label: 'Out of Ectoplasm', category: ['Informative'] },
    { key: 'Familiar Summoned', filename: 'Familiar.mp3', label: 'Familiar Summoned', category: ['Informative'] },
    { key: 'God Book', filename: 'God Book.mp3', label: 'God Book', category: ['Informative'] },
    { key: 'Health (Low)', filename: 'Health Low.mp3', label: 'Health (Low)', category: ['Informative'] },
    { key: 'Relentless', filename: 'ImRelentless.mp3', label: 'Relentless Procced', category: ['Informative'] },
    { key: 'Incense Sticks (Kwuarm)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Kwuarm)', category: ['Informative'] },
    { key: 'Incense Sticks (Lantadyme)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Lantadyme)', category: ['Informative'] },
    { key: 'Incense Sticks (Fellstalk)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Fellstalk)', category: ['Informative'] },
    { key: 'Incense Sticks (Dwarf Weed)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Dwarf Weed)', category: ['Informative'] },
    { key: 'Incense Sticks (Ranarr)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Ranarr)', category: ['Informative'] },
    { key: 'No Runes', filename: 'NoRunes.mp3', label: 'Out of runes', category: ['Informative'] },
    { key: 'Overload', filename: 'Overload.mp3', label: 'Overload expired', category: ['Informative'] },
    { key: 'Supreme Overload', filename: 'Overload.mp3', label: 'Supreme Overload expired', category: ['Informative'] },
    { key: 'Elder Overload', filename: 'Overload.mp3', label: 'Elder Overload expired', category: ['Informative'] },
    { key: 'Payment', filename: 'Payment.mp3', label: 'Ability needs additional payment', category: ['Informative'] },
    { key: 'Prayer Renewal', filename: 'Prayer Renewal.mp3', label: 'Prayer Renewal expired', category: ['Informative'] },
    { key: 'Runes', filename: 'Runes.mp3', label: 'Runes', category: ['Informative'] },
    { key: 'Scream', filename: 'Scream.mp3', label: 'Scream', category: ['Informative'] },
    { key: 'Sip Prayer', filename: 'Sip Prayer.mp3', label: 'Sip Prayer', category: ['Informative'] },
    { key: 'Strike Again', filename: 'Strike Again.mp3', label: 'Strike Again', category: ['Informative'] },
    { key: 'Summoning Points', filename: 'Summoning Points.mp3', label: 'Out of Summoning Points', category: ['Informative'] },
    { key: 'Weapon Poison', filename: 'Weapon Poison.mp3', label: 'Weapon Poison expired', category: ['Informative'] },
    { key: 'Prayer (Empty)', filename: 'Prayer Empty.mp3', label: 'Out of prayer points', category: ['Informative'] },
    { key: 'Prayer (Low)', filename: 'Prayer Low.mp3', label: 'Prayer points are low', category: ['Informative'] },

    // Chat Alerts found below this point

    // Nakatra
    { key: 'Prepare for death', filename: 'Nakatra Prepare.mp3', label: 'Nakatra - Immersive - Prepare for death...', category: ['Immersive'] },
    { key: 'I\'m afraid this is where your story ends', filename: 'Nakatra Story Ends.mp3', label: 'Nakatra - Immersive - ...where your story ends', category: ['Immersive'] },
    { key: 'The soulfire erases all', filename: 'Nakatra Soulfire.mp3', label: 'Nakatra - Immersive - The soulfire erases all', category: ['Immersive'] },
    { key: 'Be obliterated!', filename: 'Nakatra Be Obliterated.mp3', label: 'Nakatra - Immersive - Be obliterated!', category: ['Immersive'] },
    { key: 'The Sanctum is mine to control', filename: 'Nakatra Control.mp3', label: 'Nakatra - Immersive - The Sanctum is mine to control', category: ['Immersive'] },
    { key: 'Face judgement foul wretch', filename: 'Nakatra Face Judgment.mp3', label: 'Nakatra - Immersive - Face judgement foul wretch', category: ['Immersive'] },
    { key: 'Feel the power beneath your feet', filename: 'Nakatra Feel the Power.mp3', label: 'Nakatra - Immersive - Feel the power beneath your feet', category: ['Immersive'] },
    { key: 'The Sanctum will protect me while I only grow stronger', filename: 'Nakatra Protect Me.mp3', label: 'Nakatra - Immersive - The Sanctum will protect me while I only grow stronger', category: ['Immersive'] },
    { key: 'Nefthys', filename: 'Nakatra Nefthys.mp3', label: 'Nakatra - Immersive - Nefthys!', category: ['Immersive'] },
    { key: 'Be healed', filename: 'Nakatra Nefthys Heal.mp3', label: 'Nakatra - Immersive - Be healed!', category: ['Immersive'] },
    { key: 'Nefthys, be restored', filename: 'Nakatra Nefthys Heal.mp3', label: 'Nakatra - Immersive - Nefthys, be restored!', category: ['Immersive'] },
    { key: 'We are eternal', filename: 'Nakatra Nefthys Heal.mp3', label: 'Nakatra - Immersive - We are eternal!', category: ['Immersive'] },
    { key: 'Suffer the full power of the Sanctum', filename: 'Nakatra Full Power.mp3', label: 'Nakatra - Immersive - Suffer the full power of the Sanctum', category: ['Immersive'] },
    { key: 'The Devourer will consume your soul', filename: 'Nakatra Consume.mp3', label: 'Nakatra - Immersive - The Devourer will consume your soul', category: ['Immersive'] },
    { key: 'You would have made a fine addition to our order', filename: 'Nakatra Fine Addition.mp3', label: 'Nakatra - Immersive - You would have made a fine addition to our order', category: ['Immersive'] },
    { key: 'YOUR SOUL IS MINE', filename: 'Nakatra Devourer.mp3', label: 'Nakatra - Immersive - YOUR SOUL IS MINE!', category: ['Immersive'] },
    { key: 'Impossible...', filename: 'Nakatra Impossible.mp3', label: 'Nakatra - Immersive - Impossible...', category: ['Immersive'] },
    { key: 'WHAT ARE YOU', filename: 'Nakatra What Are You.mp3', label: 'Nakatra - Immersive - WHAT ARE YOU?', category: ['Immersive'] },
    { key: 'Your death is inevitable', filename: 'Nakatra Inevitable.mp3', label: 'Nakatra - Immersive - Your death is inevitable', category: ['Immersive'] },
    { key: 'Arghh', filename: 'Nakatra Scream.mp3', label: 'Nakatra - Immersive - Arghh', category: ['Immersive'] },
    { key: 'You cannot stop me', filename: 'Nakatra Cannot Stop Me.mp3', label: 'Nakatra - Immersive - You cannot stop me!', category: ['Immersive'] },
    { key: 'Enough!', filename: 'Nakatra Enough.mp3', label: 'Nakatra - Immersive - Enough!', category: ['Immersive'] },
    { key: 'This is over!', filename: 'Nakatra Over.mp3', label: 'Nakatra - Immersive - This is over!', category: ['Immersive'] },
    { key: 'For... the order', filename: 'Nakatra Defeat.mp3', label: 'Nakatra - Immersive - For... the order', category: ['Immersive'] },

    // Telos
    { key: 'Your anima will return to the source', filename: 'Telos Tendril Attack.wav', label: 'Telos - Immersive - Your anima will return to the source', category: ['Immersive']},
    { key: 'Gielinor, give me strength!', filename: 'Telos Uppercut.wav', label: 'Telos - Immersive - Geilinor, give me strength!', category: ['Immersive']},
    { key: 'Hold still, invader', filename: 'Telos Stun.wav', label: 'Telos - Immersive - Hold still, invader', category: ['Immersive']},
    { key: 'SO. MUCH. POWER!', filename: 'Telos So Much Power.wav', label: 'Telos - Immersive - SO. MUCH. POWER!', category: ['Immersive']},
    { key: 'Let the anima consume you!', filename: 'Telos Weak Anima Bomb.wav', label: 'Telos - Immersive - Let the anima consume you!', category: ['Immersive']},
    { key: 'You dare to defy me?', filename: 'Telos Instakill.wav', label: 'Telos - Immersive - You dare to defy me?', category: ['Immersive']},
    { key: 'You dare to use my power against me?', filename: 'Telos Font.wav', label: 'Telos - Immersive - Dare to use my power against me', category: ['Immersive']},
];