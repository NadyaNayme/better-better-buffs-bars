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
    { key: 'Prepare for death', filename: 'Prepare for Death.mp3', label: 'Nakatra - Prepare for death...' },
    { key: 'Your anima will return to the source', filename: 'Telos Tendril Attack.wav', label: 'Telos - Immersive Audio - Your anima will return to the source'},
    { key: 'Gielinor, give me strength!', filename: 'Telos Uppercut.wav', label: 'Telos - Immersive Audio - Geilinor, give me strength!'},
    { key: 'Hold still, invader', filename: 'Telos Stun.wav', label: 'Telos - Immersive Audio - Hold still, invader'},
    { key: 'SO. MUCH. POWER!', filename: 'Telos So Much Power.wav', label: 'Telos - Immersive Audio - SO. MUCH. POWER!'},
    { key: 'Let the anima consume you!', filename: 'Telos Weak Anima Bomb.wav', label: 'Telos - Immersive Audio - Let the anima consume you!'},
    { key: 'You dare to defy me?', filename: 'Telos Instakill.wav', label: 'Telos - Immersive Audio - You dare to defy me?'},
    { key: 'You dare to use my power against me?', filename: 'Telos Font.wav', label: 'Telos - Immersive Audio - Dare to use my power against me'},
];