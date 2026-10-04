/* eslint-disable @next/next/no-img-element -- Static WebP assets need no client image runtime. */
import styles from "./ShockwaveFlow.module.scss";

const stages = [
  { image: "/1-slide.webp", width: 550, height: 285, number: "01", title: "Взрыв", text: "Возникает внешнее воздействие." },
  { image: "/2-slide.webp", width: 552, height: 286, number: "02", title: "Ударная волна", text: "Нагрузка достигает остекления." },
  { image: "/3-slide.webp", width: 552, height: 288, number: "03", title: "Разрушение", text: "Стекло трескается при достаточной нагрузке." },
  { image: "/4-slide.webp", width: 552, height: 287, number: "04", title: "Удержание", text: "Плёнка связывает фрагменты." },
  { image: "/5-slide.webp", width: 554, height: 280, number: "05", title: "Меньше риска", text: "Снижается свободный разлёт осколков." },
];

export function ShockwaveFlow() {
  return (
    <div className={`${styles.root} shock-flow`} aria-label="Схема воздействия ударной волны на остекление">
      <div className="shock-line" aria-hidden="true"><span /></div>
      {stages.map((stage) => (
        <article className="shock-card" key={stage.number}>
          <div className="shock-image">
            <img src={stage.image} alt="" width={stage.width} height={stage.height} loading="lazy" decoding="async" />
          </div>
          <h3>{stage.title}</h3>
          <p>{stage.text}</p>
        </article>
      ))}
    </div>
  );
}
