export default function VideoPlayer({ src }: { src: string }) {
  return (
    <video
      src={src}
      controls
      className="absolute inset-0 w-full h-full object-contain rounded"
    />
  )
}