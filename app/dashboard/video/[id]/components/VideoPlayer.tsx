export default function VideoPlayer({ src }: { src: string }) {
  return (
    <div className="w-full max-w-4xl aspect-video">
      <video
        src={src}
        controls
        className="w-full h-full object-contain rounded"
      />
    </div>
  )
}