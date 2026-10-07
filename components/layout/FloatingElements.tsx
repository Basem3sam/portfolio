const shapes = [
  'size-[100px] top-[10%] left-[10%] [animation-delay:0s]',
  'size-[150px] top-[60%] right-[10%] [animation-delay:-5s]',
  'size-20 bottom-[20%] left-[20%] [animation-delay:-10s]',
];

const base =
  'absolute max-w-[100vw] animate-float-around overflow-hidden rounded-[20px] border border-black/5 bg-black/[0.03] backdrop-blur-[10px] max-md:hidden dark:border-[rgba(251,191,36,0.08)] dark:bg-[rgba(251,191,36,0.03)]';

export default function FloatingElements() {
  return (
    <>
      {shapes.map((shape) => (
        <div key={shape} className={`${base} ${shape}`}></div>
      ))}
    </>
  );
}
