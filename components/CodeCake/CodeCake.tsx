import Image from 'next/image';

export const CodeCake = () => {
  return (
    <a
      href="https://t.me/konstankk"
      target="_blank"
      rel="noopener"
      aria-label="Ссылка на контакт разработчика (откроется в новой вкладке)"
    >
      <Image src="/codecake.svg" alt="Разработано в CODECAKE" width={235} height={37} />
    </a>
  );
};
