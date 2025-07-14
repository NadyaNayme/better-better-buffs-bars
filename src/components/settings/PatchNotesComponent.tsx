import { useState, useEffect } from "react";
import { patchNotes } from "../../data/patchNotes";

export function PatchNotesComponent({ onClose }: { onClose: () => void }) {
  const [selectedVersion, setSelectedVersion] = useState(patchNotes[0].version);
  const selectedNote = patchNotes.find(note => note.version === selectedVersion);

  const handleClose = () => {
    localStorage.setItem("lastViewedPatchNote", patchNotes[0].version);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="bg-zinc-900 text-white rounded-lg shadow-2xl w-[800px] h-[600px] flex overflow-hidden relative">
        <div className="w-1/4 bg-zinc-800 border-r border-zinc-700 p-4 overflow-y-auto">
          <h3 className="text-lg font-bold mb-3">Versions</h3>
          <ul className="space-y-1">
            {patchNotes.map(note => (
              <li key={note.version}>
                <button
                  onClick={() => setSelectedVersion(note.version)}
                  className={`w-full text-left px-2 py-1 rounded text-sm ${
                    selectedVersion === note.version
                      ? "bg-zinc-700 font-semibold"
                      : "hover:bg-zinc-700"
                  }`}
                >
                  {note.version}
                  <div className="text-xs text-zinc-400">{note.date}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-3/4 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold">{selectedNote?.version}</h2>
          <div className="text-sm text-zinc-400 mb-2">Released {selectedNote?.date}</div>
          <h3 className="text-xl font-semibold mb-4">📦 {selectedNote?.title}</h3>

          {selectedNote && selectedNote.errors && selectedNote.errors.length && selectedNote.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-red-300 mb-1">☠️ Errors</h4>
              <ul className="list-disc pl-5 space-y-1">
                {selectedNote.errors.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}    

          {selectedNote && selectedNote.highlights && selectedNote.highlights.length && selectedNote.highlights.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-blue-300 mb-1">🌟 Highlights</h4>
              <ul className="list-disc pl-5 space-y-1">
                {selectedNote.highlights.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          {selectedNote && selectedNote.added && selectedNote.added.length && selectedNote.added.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-yellow-300 mb-1">✨ Added</h4>
              <ul className="list-disc pl-5 space-y-1">
                {selectedNote.added.map((item, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            </div>
          )}

          {selectedNote && selectedNote.fixes && selectedNote.fixes.length && selectedNote.fixes.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-purple-300 mb-1">🛠 Fixes</h4>
              <ul className="list-disc pl-5 space-y-1">
                {selectedNote.fixes.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          {selectedNote && selectedNote.knownIssues && selectedNote.knownIssues.length && selectedNote.knownIssues.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-orange-300 mb-1">⚠️ Known Issues</h4>
              <ul className="list-disc pl-5 space-y-1">
                {selectedNote.knownIssues.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}      

        </div>

        <button
          onClick={handleClose}
          className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}