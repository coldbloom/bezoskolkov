import Image from "next/image";
import styles from "./ShockwaveFlow.module.scss";

const stages = [
  { image: "/1-slide.jpg", number: "01", title: "Взрыв", text: "Возникает внешнее воздействие." },
  { image: "/2-slide.jpg", number: "02", title: "Ударная волна", text: "Нагрузка достигает остекления." },
  { image: "/3-slide.jpg", number: "03", title: "Разрушение", text: "Стекло трескается при достаточной нагрузке." },
  { image: "/4-slide.jpg", number: "04", title: "Удержание", text: "Плёнка связывает фрагменты." },
  { image: "/5-slide.jpg", number: "05", title: "Меньше риска", text: "Снижается свободный разлёт осколков." },
];

export function ShockwaveFlow() {
  return (
    <div className={`${styles.root} shock-flow`} aria-label="Схема воздействия ударной волны на остекление">
      <div className="shock-line" aria-hidden="true"><span /></div>
      {stages.map((stage, index) => (
        <article className="shock-card" style={{ "--stage": index } as React.CSSProperties} key={stage.number}>
          <div className="shock-image">
            <Image src={stage.image} alt="" fill sizes="(max-width: 900px) calc(100vw - 54px), (max-width: 1304px) 19vw, 236px" />
          </div>
          <h3>{stage.title}</h3>
          <p>{stage.text}</p>
        </article>
      ))}
    </div>
  );
}
