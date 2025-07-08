import { useState, useEffect, useRef, useCallback } from 'react';
import useStore from '../store';
import * as BuffReader from 'alt1/buffs';

import AdrenalinePotion from '../assets/data/Adrenaline_Potion.data.png';
import Affliction from '../assets/data/Affliction.data.png';
import AggressionPotion from '../assets/data/Aggression_Potion.data.png';
import AncientElvenRitualShard from '../assets/data/Ancient_Elven_Ritual_Shard.data.png';
import Anguish from '../assets/data/Anguish.data.png';
import AnimateDead from '../assets/data/Animate_Dead.data.png';
import Anticipation from '../assets/data/Anticipation.data.png';
import Antifire from '../assets/data/antifire_top.data.png';
import Antipoison from '../assets/data/Anti-poison_Active.data.png';
import Aura from '../assets/data/Aura.data.png';
import BalanceByForce from '../assets/data/balance_by_force.data.png';
import Barricade from '../assets/data/Barricade.data.png';
import Berserk from '../assets/data/Berserk.data.png';
import BikArrows from '../assets/data/bik_arrows.data.png';
import BlackVirus from '../assets/data/Black_virus.data.png';
import BlackstoneArrows from '../assets/data/blackstone_arrows.data.png';
import Bloated from '../assets/data/bloated.data.png';
import BlueVirus from '../assets/data/Blue_virus.data.png';
import BonfireBoost from '../assets/data/Bonfire_Boost.data.png';
import Cease from '../assets/data/Cease.data.png';
import ChronicleAttraction from '../assets/data/Chronicle_Attraction.data.png';
import CrystalMask from '../assets/data/Crystal_Mask.data.png';
import CrystalRain from '../assets/data/Crystal_Rain-minimal.data.png';
import Darkness from '../assets/data/Darkness.data.png';
import DeathGuard from '../assets/data/Death_Guard_Special-top.data.png';
import DeathMark from '../assets/data/Death_Mark.data.png';
import DeathSpark from '../assets/data/Death_Spark.data.png';
import DeathSparkUnready from '../assets/data/Death_Spark-notready.data.png';
import DeathsSwiftness from '../assets/data/Deaths_Swiftness-top.data.png';
import DeathsporeArrows from '../assets/data/deathspore_arrows-quiver.data.png';
import Debilitate from '../assets/data/Debilitate.data.png';
import DeflectMagic from '../assets/data/Deflect_Magic.data.png';
import DeflectMelee from '../assets/data/Deflect_Melee.data.png';
import DeflectNecromancy from '../assets/data/Deflect_Necromancy.data.png';
import DeflectRanged from '../assets/data/Deflect_Ranged.data.png';
import DemonSlayer from '../assets/data/Demon_Slayer.data.png';
import Desolation from '../assets/data/Desolation.data.png';
import Devotion from '../assets/data/Devotion.data.png';
import DiamondBakBolts from '../assets/data/diamond_bak_bolts.data.png';
import Divert from '../assets/data/Divert.data.png';
import DragonSlayer from '../assets/data/Dragon_Slayer.data.png';
import DwarfWeedIncense from '../assets/data/Dwarf_Weed_Incense_Sticks.data.png';
import EnhancedExcalibur from '../assets/data/Enhanced_Excalibur-scuffed.data.png';
import ElderOverload from '../assets/data/Elder_Overload.data.png';
import ErethdorsGrimoire from '../assets/data/Erethdor\'s_grimoire.data.png';
import FellstalkIncense from '../assets/data/Fellstalk_Incense_Sticks.data.png';
import Freedom from '../assets/data/Freedom.data.png';
import FulArrows from '../assets/data/ful_arrows.data.png';
import GladiatorsRage from '../assets/data/Gladiators_Rage.data.png';
import GreaterDeathsSwiftness from '../assets/data/Greater_Death\'s_Swiftness.data.png';
import GreaterSunshine from '../assets/data/Greater_Sunshine.data.png';
import GreenVirus from '../assets/data/Green_virus.data.png';
import HydrixBakBolts from '../assets/data/hydrix_bak_bolts.data.png';
import Immortality from '../assets/data/Immortality.data.png';
import IngenuityOfTheHumans from '../assets/data/Ingenuity_of_the_Humans.data.png';
import Instability from '../assets/data/Instability.data.png';
import InvokeLordOfBones from '../assets/data/Invoke_Lord_of_Bones.data.png';
import JasDragonbaneArrows from '../assets/data/jas_dragonbane.data.png';
import KwuarmIncense from '../assets/data/Kwuarm_Incense_Sticks.data.png';
import LantadymeIncense from '../assets/data/Lantadyme_Incense_Sticks.data.png';
import Limitless from '../assets/data/Limitless.data.png';
import LivingDeath from '../assets/data/Living_Death.data.png';
import Malevolence from '../assets/data/Malevolence.data.png';
import Necrosis from '../assets/data/Necrosis.data.png';
import OmniGuard from '../assets/data/Omni_Guard_Special-top.data.png';
import OnyxBakBolts from '../assets/data/onyx_bak_bolts.data.png';
import Overloaded from '../assets/data/Overloaded.data.png';
import PerfectEquilibrium from '../assets/data/Perfect_Equilibrium.data.png';
import PerfectEquilibriumCapped from '../assets/data/perfect_equilibrium_capped.data.png';
import Poisonous from '../assets/data/Poisonous-top.data.png';
import PowderOfPenance from '../assets/data/powder_of_penance.data.png';
import PowderOfProtection from '../assets/data/powder_of_protection.data.png';
import PowerburstPrevention from '../assets/data/Powerburst_prevention.data.png';
import PrayerActive from '../assets/data/Prayer_active.data.png';
import PrayerRenewal from '../assets/data/Prayer_Renew_Active.data.png';
import ProtectFromMagic from '../assets/data/Protect_from_Magic.data.png';
import ProtectFromMelee from '../assets/data/Protect_from_Melee.data.png';
import ProtectFromNecromancy from '../assets/data/Protect_from_Necromancy.data.png';
import ProtectFromRanged from '../assets/data/Protect_from_Ranged.data.png';
import PutridZombie from '../assets/data/putrid_zombie-top.data.png';
import RedVirus from '../assets/data/Red_virus.data.png';
import Reflect from '../assets/data/Reflect.data.png';
import ResidualSoul from '../assets/data/Residual_Soul.data.png';
import Resonance from '../assets/data/Resonance.data.png';
import RubyBakBolts from '../assets/data/ruby_bak_bolts.data.png';
import Ruination from '../assets/data/Ruination.data.png';
import SerenGodbow from '../assets/data/Seren_Godbow_Special-top.data.png';
import SignOfLife from '../assets/data/Sign_of_Life-top.data.png';
import SkeletonWarrior from '../assets/data/skeleton_warrior-top.data.png';
import Sorrow from '../assets/data/Sorrow.data.png';
import SoulSplit from '../assets/data/Soul_Split.data.png';
import SplitSoul from '../assets/data/Split_Soul.data.png';
import SplitSoulECB from '../assets/data/split_soul_ecb.data.png';
import Stunned from '../assets/data/Stunned.data.png';
import Sunshine from '../assets/data/Sunshine.data.png';
import SuperAntifire from '../assets/data/Super_Anti-Fire_Active.data.png';
import SupremeOverload from '../assets/data/supreme_overload.data.png';
import ThreadsOfFate from '../assets/data/Threads_of_Fate.data.png';
import TimeRift from '../assets/data/Time_rift.data.png';
import Torment from '../assets/data/Torment.data.png';
import Turmoil from '../assets/data/Turmoil.data.png';
import UndeadSlayer from '../assets/data/Undead_Slayer.data.png';
import VengefulGhost from '../assets/data/vengeful_ghost-top.data.png';
import Vulnerability from '../assets/data/Vulnerability_bordered.data.png';
import WenArrows from '../assets/data/wen_arrows.data.png';

const isAlt1 = typeof window.alt1 !== "undefined";

const buffImagePromises = {
  'Adrenaline Potion': AdrenalinePotion,
  'Affliction': Affliction,
  'Aggression Potion': AggressionPotion,
  'Ancient Elven Ritual Shard': AncientElvenRitualShard,
  'Anguish': Anguish,
  'Animate Dead': AnimateDead,
  'Anticipation': Anticipation,
  'Antifire': Antifire,
  'Antipoison': Antipoison,
  'Aura': Aura,
  'Balance By Force': BalanceByForce,
  'Barricade': Barricade,
  'Berserk': Berserk,
  'Bik Arrows': BikArrows,
  'Black Virus': BlackVirus,
  'Black Stone Arrows': BlackstoneArrows,
  'Bloated': Bloated,
  'Blue Virus': BlueVirus,
  'Bonfire Boost': BonfireBoost,
  'Cease': Cease,
  'Chronicle Attraction': ChronicleAttraction,
  'Crystal Mask': CrystalMask,
  'Crystal Rain': CrystalRain,
  'Darkness': Darkness,
  'Death Guard': DeathGuard,
  'Death Mark': DeathMark,
  'Death Spark (Ready)': DeathSpark,
  'Death Spark (Unready)': DeathSparkUnready,
  'Deaths Swiftness': DeathsSwiftness,
  'Deathspore Arrows': DeathsporeArrows,
  'Debilitate': Debilitate,
  'Deflect Magic': DeflectMagic,
  'Deflect Melee': DeflectMelee,
  'Deflect Necromancy': DeflectNecromancy,
  'Deflect Ranged': DeflectRanged,
  'Demon Slayer': DemonSlayer,
  'Desolation': Desolation,
  'Devotion': Devotion,
  'Diamond Bakriminel Bolts (e)': DiamondBakBolts,
  'Divert': Divert,
  'Dragon Slayer': DragonSlayer,
  'Enhanced Excalibur': EnhancedExcalibur,
  'Elder Overload': ElderOverload,
  'Erethdors Grimoire': ErethdorsGrimoire,
  'Freedom': Freedom,
  'Ful Arrows': FulArrows,
  'Gladiators Rage': GladiatorsRage,
  'Greater Deaths Swiftness': GreaterDeathsSwiftness,
  'Greater Sunshine': GreaterSunshine,
  'Green Virus': GreenVirus,
  'Hydrix Bakriminel Bolts (e)': HydrixBakBolts,
  'Immortality': Immortality,
  'Ingenuity of the Humans': IngenuityOfTheHumans,
  'Incense Sticks (Dwarf Weed)': DwarfWeedIncense,
  'Incense Sticks (Fellstalk)': FellstalkIncense,
  'Incense Sticks (Kwuarm)': KwuarmIncense,
  'Incense Sticks (Lantadyme)': LantadymeIncense,
  'Instability': Instability,
  'Invoke Lord of Bones': InvokeLordOfBones,
  'Jas Dragonbane Arrows': JasDragonbaneArrows,
  'Limitless': Limitless,
  'Living Death': LivingDeath,
  'Malevolence': Malevolence,
  'Necrosis': Necrosis,
  'Omni Guard': OmniGuard,
  'Onyx Bakriminel Bolts (e)': OnyxBakBolts,
  'Overload': Overloaded,
  'Perfect Equilibrium': PerfectEquilibrium,
  'Perfect Equilibrium (capped)': PerfectEquilibriumCapped,
  'Powder of Penance': PowderOfPenance,
  'Powder of Protection': PowderOfProtection,
  'Powerburst Prevention': PowerburstPrevention,
  'Prayer Active': PrayerActive,
  'Prayer Renewal': PrayerRenewal,
  'Protect From Magic': ProtectFromMagic,
  'Protect From Melee': ProtectFromMelee,
  'Protect From Necromancy': ProtectFromNecromancy,
  'Protect From Ranged': ProtectFromRanged,
  'Putrid Zombie': PutridZombie,
  'Red Virus': RedVirus,
  'Reflect': Reflect,
  'Residual Soul': ResidualSoul,
  'Resonance': Resonance,
  'Ruby Bakriminel Bolts (e)': RubyBakBolts,
  'Ruination': Ruination,
  'Seren Godbow': SerenGodbow,
  'Sign of Life': SignOfLife,
  'Skeleton Warrior': SkeletonWarrior,
  'Sorrow': Sorrow,
  'Soul Split': SoulSplit,
  'Split Soul': SplitSoul,
  'Split Soul (ECB)': SplitSoulECB,
  'Stunned': Stunned,
  'Sunshine': Sunshine,
  'Super Antifire': SuperAntifire,
  'Supreme Overload': SupremeOverload,
  'Threads of Fate': ThreadsOfFate,
  'Time Rift': TimeRift,
  'Torment': Torment,
  'Turmoil': Turmoil,
  'Undead Slayer': UndeadSlayer,
  'Vengeful Ghost': VengefulGhost,
  'Vulnerability': Vulnerability,
  'Weapon Poison': Poisonous,
  'Wen Arrows': WenArrows
};

interface BuffReaderProps {
  isDebuff?: boolean;
  debugMode: boolean;
  onBuffsIdentified: (identifiedBuffs: Map<string, { time: number }>) => void;
  readInterval?: number;
}

type ComponentStatus = "IDLE" | "LOADING_IMAGES" | "FINDING_BAR" | "READING" | "ERROR";

export function BuffReaderComponent({ 
  isDebuff = false, 
  debugMode,
  onBuffsIdentified,
  readInterval = 250,
}: BuffReaderProps) {
  const [status, setStatus] = useState<ComponentStatus>("IDLE");
  const [enableDebug, setEnableDebug] = useState(false);
  const [debugMatchData, setDebugMatchData] = useState(new Map());

  const readerRef = useRef<any>(null);
  const resolvedImagesRef = useRef<Map<string, any> | null>(null);
  const intervalRef = useRef<number | null>(null);
  const findRetryTimeoutRef = useRef<number | null>(null);

  const updateDebugData = (buffName: string, fail: number, pass: number) => {
    if (!enableDebug) return;
    setDebugMatchData(prev => {
      const newMap = new Map(prev);
      const history = newMap.get(buffName) || [];
      const newHistory = [...history, { fail, pass }];
  
      if (newHistory.length > 100) newHistory.shift();
  
      newMap.set(buffName, newHistory);
      return newMap;
    });
  };

  const formatStats = (arr: number[]) => {
    if (!arr.length) return "N/A";
    const values = arr.map(x => x);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((a,b) => a+b, 0) / values.length);
    return `Min: ${min}, Max: ${max}, Avg: ${avg}`;
  };

  const processReaderData = useCallback((detectedBuffs: any[]) => {
    if (!resolvedImagesRef.current) return;
 
    const inCombat = useStore.getState().inCombat;
    if (!inCombat) { 
      console.log('Not rendering overlays, user is not in combat.')
      return;
    }

    const groups = useStore.getState().groups;
    const allBuffs = useStore.getState().buffs;
  
    const trackedBuffMap = new Map(groups.flatMap(g => g.buffs).map(b => [b.name, b]));
    const finalPayloadMap = new Map<string, any>();
  
    for (const detected of detectedBuffs) {
      for (const [name, trackedBuff] of trackedBuffMap.entries()) {
        if (!trackedBuff) continue;
        if (isDebuff && trackedBuff.buffType === "Buff") continue;
        if (!isDebuff && trackedBuff.buffType === "Debuff") continue;
  
        const { passThreshold, failThreshold } = useStore.getState().getBuffThresholds(trackedBuff.name);
  
        // Meta buff logic
        if (trackedBuff.buffType === 'Meta' && trackedBuff.childBuffNames) {
          for (const childName of trackedBuff.childBuffNames) {
            const img = resolvedImagesRef.current.get(childName);
            if (!img) continue;
  
            const match = detected.countMatch(img, false);
            if (enableDebug) {
              updateDebugData(trackedBuff.name, match.failed, match.passed);
              console.log(trackedBuff.name, match.failed, match.passed);
            }
            if (match.passed >= passThreshold && match.failed <= failThreshold) {
              const time = detected.readTime ? detected.readTime() : detected.time;
              const childData = allBuffs.find(b => b.name === childName);
              if (childData) {
                finalPayloadMap.set(name, {
                  name,
                  time: time,
                  foundChild: {
                    imageData: childData.scaledImageData ?? childData.imageData,
                    desaturatedImageData: childData.scaledDesaturatedImageData ?? childData.desaturatedImageData,
                  }
                });
              }
              break; // stop after first match
            }
          }
        }
  
        // Normal buff logic
        else {
          const refImg = resolvedImagesRef.current.get(name);
          if (!refImg) continue;
  
          const match = detected.countMatch(refImg, false);
          if (enableDebug) {
            updateDebugData(trackedBuff.name, match.failed, match.passed);
          }
          if (match.passed >= passThreshold && match.failed <= failThreshold) {
            finalPayloadMap.set(name, {
              name,
              time: detected.readTime ? detected.readTime() : detected.time,
            });
          }
        }
      }
    }
  
    onBuffsIdentified(finalPayloadMap);
  }, [onBuffsIdentified, enableDebug]);

  useEffect(() => {
    if (!enableDebug) {
      setDebugMatchData(new Map());
    }
  }, [enableDebug]);

  useEffect(() => {
    const cleanup = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (findRetryTimeoutRef.current) clearTimeout(findRetryTimeoutRef.current);
    };
    
    if (status === "IDLE") {
      if (isAlt1) {
        setStatus("LOADING_IMAGES");
      }
    }
    
    else if (status === "LOADING_IMAGES") {
      const loadImages = async () => {
        const imageNames = Object.keys(buffImagePromises);
        const promises = Object.values(buffImagePromises);
        try {
          const loadedModules = await Promise.all(promises);
          const resolvedMap = new Map<string, any>();
          imageNames.forEach((name, index) => {
            resolvedMap.set(name, loadedModules[index]);
          });
          resolvedImagesRef.current = resolvedMap;
          console.log("✅ Reference images loaded successfully.");
          setStatus("FINDING_BAR");
        } catch (error) {
          console.error("Failed to load reference images:", error);
          setStatus("ERROR");
        }
      };
      loadImages();
    }
    
    else if (status === "FINDING_BAR") {
      const findBar = () => {
        if (!readerRef.current) {
          readerRef.current = new BuffReader.default();
          if (isDebuff) readerRef.current.debuffs = true;
        }
        
        const position = readerRef.current.find();
        if (position) {
          setStatus("READING");
        } else {
          findRetryTimeoutRef.current = setTimeout(findBar, 3000);
        }
      }
      findBar();
    }
    
    else if (status === "READING") {
      console.log(`[${isDebuff ? "Debuff" : "Buff"} Reader] Starting read interval...`);
      intervalRef.current = setInterval(() => {
        const data = readerRef.current?.read();
        if (data) {
          processReaderData(data);
        }
      }, readInterval);
    }
    
    return cleanup;
  }, [status, isDebuff, readInterval, processReaderData]);

  return (debugMode &&
    <>
      <div style={{ padding: '5px', border: '1px solid #555', marginTop: '5px' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{isDebuff ? "Debuff Reader" : "Buff Reader"}</p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Status: {status}</p>
      </div>
      <label style={{ display: 'block', marginBottom: 10 }}>
        <input
          type="checkbox"
          checked={enableDebug}
          onChange={(e) => setEnableDebug(e.target.checked)}
        />
        Enable Thresholds Debugging
      </label>
      {enableDebug && (
      <div style={{ marginTop: 10 }}>
        <h4>{isDebuff ? "Debuff Threshold Data" : "Buff Threshold Data"}</h4>
        {[...debugMatchData.entries()].map(([buffName, history]) => {
          const failArr = history.map((e: { fail: number; }) => e.fail);
          const passArr = history.map((e: { pass: number; }) => e.pass);
          return (
            <div key={buffName}>
              <strong>{buffName}</strong><br/>
              Fail: {formatStats(failArr)} | Pass: {formatStats(passArr)}
            </div>
          );
        })}
      </div>)}
    </>
  );
}