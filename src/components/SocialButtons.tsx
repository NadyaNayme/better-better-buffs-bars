export function SocialButtons() {
  return (
    <div className="flex gap-4 mt-4">
      <a
        href="https://discord.gg/KJ2SgWyJFF"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#5865F2] text-white font-semibold px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
      >
        <DiscordIcon className="w-5 h-5" />
        Join the Discord
      </a>

      <a
        href="https://ko-fi.com/nadyanayme"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#FF5E5B] text-white font-semibold px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
      >
        <KofiIcon className="w-5 h-5" />
        Donate
      </a>
    </div>
  );
}

function DiscordIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M60.104 4.552A58.43 58.43 0 0044.065.8a.109.109 0 00-.115.054 40.88 40.88 0 00-1.96 4.012 56.493 56.493 0 00-16.03 0 39.81 39.81 0 00-1.978-4.012.117.117 0 00-.115-.054 58.384 58.384 0 00-16.04 3.752.106.106 0 00-.05.042C.527 24.417-.513 43.108.293 54.708a.112.112 0 00.044.078 58.66 58.66 0 0017.838 8.99.112.112 0 00.123-.042 41.617 41.617 0 003.55-5.77.11.11 0 00-.06-.155 37.468 37.468 0 01-5.29-2.54.112.112 0 01-.012-.186c.358-.27.716-.554 1.062-.84a.107.107 0 01.112-.015c11.084 5.064 23.075 5.064 34.11 0a.108.108 0 01.114.013c.346.285.704.569 1.062.84a.112.112 0 01-.01.186 35.6 35.6 0 01-5.29 2.54.11.11 0 00-.061.156 47.46 47.46 0 003.55 5.77.112.112 0 00.123.042 58.655 58.655 0 0017.838-8.99.112.112 0 00.044-.078c1.05-13.543-1.806-32.117-11.29-50.114a.097.097 0 00-.048-.044zM23.725 37.36c-3.178 0-5.788-2.918-5.788-6.517 0-3.6 2.584-6.518 5.788-6.518 3.221 0 5.813 2.935 5.788 6.518 0 3.599-2.584 6.517-5.788 6.517zm23.456 0c-3.178 0-5.788-2.918-5.788-6.517 0-3.6 2.584-6.518 5.788-6.518 3.22 0 5.813 2.935 5.788 6.518 0 3.599-2.568 6.517-5.788 6.517z"/>
    </svg>
  );
}

function KofiIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M410.2 154.6c5.3-13.7 8.2-28.5 8.2-44 0-60.4-49.1-109.5-109.5-109.5H109.5C49.1 1.1 0 50.2 0 110.6v290.8c0 60.4 49.1 109.5 109.5 109.5h177c60.4 0 109.5-49.1 109.5-109.5v-16.2c37.8-2.4 68-33.7 68-71.9v-98.4c0-38.2-30.2-69.5-68-71.9zM373.5 369c0 41.6-33.9 75.5-75.5 75.5h-177c-41.6 0-75.5-33.9-75.5-75.5V110.6c0-41.6 33.9-75.5 75.5-75.5h199.4c41.6 0 75.5 33.9 75.5 75.5 0 17.7-6.2 34-16.4 46.8-10.2 12.8-24.6 22.5-41.5 27.2a16 16 0 00-11.4 15.3v119a16 16 0 0013.4 15.8c14.7 2.2 29.7 3.4 44.7 3.4V369z"/>
    </svg>
  );
}