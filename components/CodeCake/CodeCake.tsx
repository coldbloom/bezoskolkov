/* eslint-disable @next/next/no-img-element -- A static SVG needs no client image runtime. */

export const CodeCake = () => {
  return (
    <a
      href="https://t.me/konstankk"
      target="_blank"
      rel="noopener"
      aria-label="Ссылка на контакт разработчика (откроется в новой вкладке)"
    >
      <img src="/codecake.svg" alt="Разработано в CODECAKE" width={235} height={37} loading="lazy" decoding="async" />
    </a>
  );
};
