type Category = 'Informative' | 'Immersive';
type Collection = 'Unimplemented' | 'Buff Expiring Soon' | 'On Active' | 'Combat' | 'Nakatra' | 'Telos';

export type AlertEntry = {
  key: string;
  label: string;
  filename: string;
  category: Category[];
  collection: Collection;
};

export const alertsMap: AlertEntry[] = [
    // Buff Alerts
    { key: 'Antipoison', filename: 'AntiPoison.mp3', label: 'Antipoison expired', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Cannon Decay', filename: 'Cannon Decay.mp3', label: 'Cannon Decay', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'CantDrink', filename: 'Cant Drink.mp3', label: 'Can\'t Drink Potion', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Divine Charge', filename: 'Divine Charge.mp3', label: 'Out of Divine Charges', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Ectoplasm', filename: 'Ectoplasm.mp3', label: 'Out of Ectoplasm', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Familiar Summoned', filename: 'Familiar.mp3', label: 'Familiar Summoned', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'God Book', filename: 'God Book.mp3', label: 'God Book', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Health (Low)', filename: 'Health Low.mp3', label: 'Health (Low)', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'No Runes', filename: 'NoRunes.mp3', label: 'Out of runes', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Payment', filename: 'Payment.mp3', label: 'Ability needs additional payment', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Runes', filename: 'Runes.mp3', label: 'Runes', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Scream', filename: 'Scream.mp3', label: 'Scream', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Sip Prayer', filename: 'Sip Prayer.mp3', label: 'Sip Prayer', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Strike Again', filename: 'Strike Again.mp3', label: 'Strike Again', category: ['Informative'] , collection: 'Unimplemented'},
    { key: 'Summoning Points', filename: 'Summoning Points.mp3', label: 'Out of Summoning Points', category: ['Informative'] , collection: 'Unimplemented'},

    // Alerts when Buff is about to expire
    { key: 'Animate Dead', filename: 'Animate Dead.mp3', label: 'Animate Dead', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Antifire', filename: 'Antifire.mp3', label: 'Antifire', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Aura', filename: 'Aura.mp3', label: 'Aura', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Darkness', filename: 'Darkness.mp3', label: 'Darkness', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Incense Sticks (Kwuarm)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Kwuarm)', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Incense Sticks (Lantadyme)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Lantadyme)', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Incense Sticks (Fellstalk)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Fellstalk)', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Incense Sticks (Dwarf Weed)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Dwarf Weed)', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Incense Sticks (Ranarr)', filename: 'Incense Sticks.mp3', label: 'Incense Sticks (Ranarr)', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Overload', filename: 'Overload.mp3', label: 'Overload', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Supreme Overload', filename: 'Overload.mp3', label: 'Supreme Overload', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Elder Overload', filename: 'Overload.mp3', label: 'Elder Overload', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Prayer Renewal', filename: 'Prayer Renewal.mp3', label: 'Prayer Renewal', category: ['Informative'] , collection: 'Buff Expiring Soon'},
    { key: 'Weapon Poison', filename: 'Weapon Poison.mp3', label: 'Weapon Poison', category: ['Informative'] , collection: 'Buff Expiring Soon'},

     // Alerts when buff becomes active
    { key: 'Relentless', filename: 'ImRelentless.mp3', label: 'Relentless', category: ['Informative'] , collection: 'On Active'},

    // Combat Related Alerts
    { key: 'Prayer (Empty)', filename: 'Prayer Empty.mp3', label: 'Out of prayer points', category: ['Informative'] , collection: 'Combat'},
    { key: 'Prayer (Low)', filename: 'Prayer Low.mp3', label: 'Prayer points are low', category: ['Informative'] , collection: 'Combat'},

    // Chat Alerts found below this point

    // Nakatra
    { key: 'Nakatra, Devourer Eternal: Prepare for death', filename: 'Nakatra Prepare.mp3', label: 'Prepare for death...', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: I\'m afraid this is where your story ends', filename: 'Nakatra Story Ends.mp3', label: '...where your story ends', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: The soulfire erases all', filename: 'Nakatra Soulfire.mp3', label: 'The soulfire erases all', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Be obliterated!', filename: 'Nakatra Be Obliterated.mp3', label: 'Be obliterated!', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: The Sanctum is mine to control', filename: 'Nakatra Control.mp3', label: 'The Sanctum is mine to control', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Face judgement foul wretch', filename: 'Nakatra Face Judgment.mp3', label: 'Face judgement foul wretch', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Feel the power beneath your feet', filename: 'Nakatra Feel the Power.mp3', label: 'Feel the power beneath your feet', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: The Sanctum will protect me while I only grow stronger', filename: 'Nakatra Protect Me.mp3', label: 'The Sanctum will protect me while I only grow stronger', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Nefthys', filename: 'Nakatra Nefthys.mp3', label: 'Nefthys!', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Be healed', filename: 'Nakatra Nefthys Heal.mp3', label: 'Be healed!', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Nefthys, be restored', filename: 'Nakatra Nefthys Heal.mp3', label: 'Nefthys, be restored!', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: We are eternal', filename: 'Nakatra Nefthys Heal.mp3', label: 'We are eternal!', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Suffer the full power of the Sanctum', filename: 'Nakatra Full Power.mp3', label: 'Suffer the full power of the Sanctum', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: The Devourer will consume your soul', filename: 'Nakatra Consume.mp3', label: 'The Devourer will consume your soul', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: You would have made a fine addition to our order', filename: 'Nakatra Fine Addition.mp3', label: 'You would have made a fine addition to our order', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: YOUR SOUL IS MINE', filename: 'Nakatra Devourer Amascut.mp3', label: 'YOUR SOUL IS MINE!', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Impossible...', filename: 'Nakatra Impossible.mp3', label: 'Impossible...', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: WHAT ARE YOU', filename: 'Nakatra What Are You.mp3', label: 'WHAT ARE YOU?', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Your death is inevitable', filename: 'Nakatra Inevitable.mp3', label: 'Your death is inevitable', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Arghh', filename: 'Nakatra Scream.mp3', label: 'Arghh', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: You cannot stop me', filename: 'Nakatra Cannot Stop Me.mp3', label: 'You cannot stop me!', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: Enough!', filename: 'Nakatra Enough.mp3', label: 'Enough!', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: This is over!', filename: 'Nakatra Over.mp3', label: 'This is over!', category: ['Immersive'] , collection: 'Nakatra'},
    { key: 'Nakatra, Devourer Eternal: For... the order', filename: 'Nakatra Defeat.mp3', label: 'For... the order', category: ['Immersive'] , collection: 'Nakatra'},

    // Telos
    { key: 'Telos: Your anima will return to the source', filename: 'Telos Tendril Attack.wav', label: 'Your anima will return to the source', category: ['Immersive'], collection: 'Telos'},
    { key: 'Telos: Gielinor, give me strength!', filename: 'Telos Uppercut.wav', label: 'Geilinor, give me strength!', category: ['Immersive'], collection: 'Telos'},
    { key: 'Telos: Hold still, invader', filename: 'Telos Stun.wav', label: 'Hold still, invader', category: ['Immersive'], collection: 'Telos'},
    { key: 'Telos: SO. MUCH. POWER!', filename: 'Telos So Much Power.wav', label: 'SO. MUCH. POWER!', category: ['Immersive'], collection: 'Telos'},
    { key: 'Telos: Let the anima consume you!', filename: 'Telos Weak Anima Bomb.wav', label: 'Let the anima consume you!', category: ['Immersive'], collection: 'Telos'},
    { key: 'Telos: You dare to defy me?', filename: 'Telos Instakill.wav', label: 'You dare to defy me?', category: ['Immersive'], collection: 'Telos'},
    { key: 'Telos: You dare to use my power against me?', filename: 'Telos Font.wav', label: 'Dare to use my power against me', category: ['Immersive'], collection: 'Telos'},
];