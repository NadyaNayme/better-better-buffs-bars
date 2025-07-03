import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
// @ts-ignore
import useStore from './store';
// @ts-ignore
import Group from './components/Group';
// @ts-ignore
import ProfileManager from './components/ProfileManager';
// @ts-ignore
import { isAlt1Available } from "./lib/alt1Utils";
function App() {
    const [alt1Detected, setAlt1Detected] = useState(false);
    const { groups, createGroup } = useStore();
    const handleCreateGroup = () => {
        const groupName = prompt('Enter group name:');
        if (groupName) {
            createGroup(groupName);
        }
    };
    const setBuffsFromJsonIfNewer = useStore((state) => state.setBuffsFromJsonIfNewer);
    useEffect(() => {
        if (isAlt1Available()) {
            console.log("✅ Alt1 detected and overlay permissions granted.");
            setAlt1Detected(true);
        }
        else {
            console.warn("⚠️ Alt1 not available or permissions missing.");
        }
        window.alt1.identifyAppUrl("./appconfig.json");
        setBuffsFromJsonIfNewer();
    }, []);
    return (_jsxs("div", { className: "bg-gray-900 text-white min-h-screen p-8", children: [_jsx("header", { className: "text-center mb-8", children: _jsx("h1", { className: "text-4xl font-bold", children: "Better Buffs Bar" }) }), !alt1Detected && (_jsx("p", { className: "text-red-500 text-center mb-8 font-bold", children: "Alt1 not detected. Please open this app inside Alt1." })), _jsx(ProfileManager, {}), _jsx("div", { className: "mb-8", children: _jsx("button", { onClick: handleCreateGroup, className: "bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded", children: "Create New Group" }) }), _jsxs("div", { className: "mb-8", children: [_jsxs("p", { children: ["Sort buffs within a group by drag & dropping using ", _jsx("em", { children: "left click" }), "."] }), _jsxs("p", { children: ["Delete buffs from a group using ", _jsx("em", { children: "right click" }), "."] })] }), _jsx("div", { className: "space-y-8", children: groups.map((group) => (_jsx(Group, { group: group }, group.id))) })] }));
}
export default App;
