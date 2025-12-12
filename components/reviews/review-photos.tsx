"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageIcon, X } from "lucide-react"

interface ReviewPhotosProps {
  photos: string[]
  storeName?: string
}

export function ReviewPhotos({ photos, storeName }: ReviewPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  if (!photos || photos.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {photos.slice(0, 3).map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square rounded-md overflow-hidden border hover:opacity-80 transition-opacity"
          >
            <img
              src={photo.startsWith("http") ? photo : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${photo}`}
              alt={`Review photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 2 && photos.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                +{photos.length - 3}
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{storeName ? `Photos from ${storeName}` : "Review Photos"}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {selectedPhoto && (
              <img
                src={selectedPhoto.startsWith("http") ? selectedPhoto : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${selectedPhoto}`}
                alt="Review photo"
                className="w-full h-auto rounded-md"
              />
            )}
            {photos.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(photo)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      selectedPhoto === photo ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={photo.startsWith("http") ? photo : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${photo}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

