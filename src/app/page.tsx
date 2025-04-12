"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"

type Area = {
  id: string
  name: string
  xPercent: number
  yPercent: number
  value: number
}

const clickableAreas = [
  { id: "visage", name: "Visage", xPercent: 28.9, yPercent: 16.8, value: 0 },
  { id: "thorax", name: "Thorax", xPercent: 38.4, yPercent: 27.8, value: 0 },
  { id: "abdomen", name: "Abdomen", xPercent: 38.4, yPercent: 44.7, value: 0 },
  { id: "brasG", name: "Bras G", xPercent: 22.1, yPercent: 26.0, value: 0 },
  { id: "avBrasG", name: "Av.Bras G", xPercent: 19.9, yPercent: 40.7, value: 0 },
  { id: "mainG", name: "Main G", xPercent: 18.8, yPercent: 48.0, value: 0 },
  { id: "doigtsG", name: "Doigts G", xPercent: 20.0, yPercent: 53.7, value: 0 },
  { id: "brasD", name: "Bras D", xPercent: 52.7, yPercent: 26.0, value: 0 },
  { id: "avBrasD", name: "Av.Bras D", xPercent: 54.0, yPercent: 40.7, value: 0 },
  { id: "mainD", name: "Main D", xPercent: 56.0, yPercent: 48.0, value: 0 },
  { id: "doigtsD", name: "Doigts D", xPercent: 56.0, yPercent: 53.7, value: 0 },
  { id: "cuisseG", name: "Cuisse G", xPercent: 31.6, yPercent: 57.7, value: 0 },
  { id: "jambeG", name: "Jambe G", xPercent: 27.1, yPercent: 70.0, value: 0 },
  { id: "piedG", name: "Pied G", xPercent: 28.1, yPercent: 78.7, value: 0 },
  { id: "cuisseD", name: "Cuisse D", xPercent: 44.0, yPercent: 57.7, value: 0 },
  { id: "jambeD", name: "Jambe D", xPercent: 49.0, yPercent: 70.0, value: 0 },
  { id: "piedD", name: "Pied D", xPercent: 48.0, yPercent: 78.7, value: 0 },
]

const scoreOptions = [
  { score: 1, label: "Sem Esclerose", color: "white" },
  { score: 2, label: "Esclerose superficial", color: "green" },
  { score: 3, label: "Esclerose intermediária", color: "yellow" },
  { score: 4, label: "Esclerose aderente ao tecido profundo", color: "red" }
]

export default function AvaliacaoPage() {
  const { toast } = useToast()
  const [areas, setAreas] = useState<Area[]>(clickableAreas)
  const [total, setTotal] = useState(0)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  useEffect(() => {
    const newTotal = areas.reduce((sum, area) => sum + area.value, 0)
    setTotal(newTotal)
  }, [areas])


  const getPixelPosition = (xPercent: number, yPercent: number) => {
    if (!imageRef.current || !imageLoaded) return { x: 0, y: 0 }

    const rect = imageRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    return {
      x: (width * xPercent) / 100,
      y: (height * yPercent) / 100,
    }
  }

  const handleCircleClick = (areaId: string) => {
    setSelectedArea(areaId === selectedArea ? null : areaId)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !imageLoaded) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const xPercent = (x / rect.width) * 100
    const yPercent = (y / rect.height) * 100

    let closestArea: Area | null = null
    let minDistance = Number.MAX_VALUE

    areas.forEach((area) => {
      const distance = Math.sqrt(Math.pow(xPercent - area.xPercent, 2) + Math.pow(yPercent - area.yPercent, 2))

      const detectionRadius = isMobile ? 10 : 7

      if (distance < minDistance && distance < detectionRadius) {
        minDistance = distance
        closestArea = area
      }
    })

    if (closestArea !== null) {
      setSelectedArea((closestArea as Area).id)
    }
  }

  const handleValueSelect = (value: number) => {
    if (!selectedArea) return

    setAreas(areas.map((area) => (area.id === selectedArea ? { ...area, value } : area)))
    setSelectedArea(null)
  }

  const handleSave = () => {
    toast({
      title: "Avaliação salva",
      description: `Pontuação total: ${total}`,
    })
  }

  const getPointSize = () => {
    if (isMobile) return "w-4 h-4 -ml-3 -mt-3 text-xs text-black"
    return "w-4 h-4 -ml-4 -mt-4 text-sm text-black"
  }

  const getCircleStyle = (value: number) => {
    if (value === 0) return "bg-red-400 bg-opacity-50 border-red-600"
    
    switch (value) {
      case 1: return "bg-white border-gray-400"
      case 2: return "bg-green-500 border-green-600"
      case 3: return "bg-yellow-500 border-yellow-600"
      case 4: return "bg-red-600 border-red-700"
      default: return "bg-red-400 bg-opacity-50 border-red-600"
    }
  }

  return (
    <div className="container mx-auto mt-4 px-2 md:px-4 flex flex-col sm:flex-row justify-center items-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-center">Calculadora Score de Rodnan</h1>
        <div className="flex flex-col items-left">
          <span className="text-sm font-bold text-center text-red-500">
            Clique no corpo humano para realizar a avaliação
          </span>
          <span className="text-2xl animate-bounce ml-28 sm:ml-36 text-red-500">↓</span>
        </div>
      
        <div className="relative w-full max-w-md rounded-lg overflow-hidden bg-white shadow-md" ref={containerRef}>
          <div className="w-full aspect-[1] relative" onClick={handleImageClick}>
            <Image
              src="https://nwywfckpkezcstti.public.blob.vercel-storage.com/Bras%20G%20%282%29%20%281%29-u3Dh0ufo7VaOtWVCC6RdK8syrjYDIZ.png"
              alt="Score de Rodnan"
              layout="fill"
              className="object-contain"
              ref={imageRef}
              onLoad={() => setImageLoaded(true)}
              priority={true}
            />
            
            {/* Círculos semitransparentes - só mostrar quando a imagem estiver carregada */}
            {imageLoaded && areas.map((area) => {
              const position = getPixelPosition(area.xPercent, area.yPercent)
              return (
                <div
                  key={area.id}
                  className={`absolute rounded-full ${getPointSize()} border-2 ${getCircleStyle(area.value)} 
                    ${selectedArea === area.id ? "ring-2 ring-blue-500" : ""} flex items-center justify-center`}
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCircleClick(area.id)
                  }}
                >
                  <span className="font-bold">{area.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div>
        {/* Menu de seleção de pontuação */}
        {selectedArea && (
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-lg mb-4 md:mb-6 w-full max-w-md">
          <h3 className="font-bold mb-2 text-sm md:text-base text-black">
            Selecione um valor para {areas.find((a) => a.id === selectedArea)?.name}:
          </h3>        
            <div className="flex justify-center space-x-3 md:space-x-4">
              {scoreOptions.map((option) => (
                <button
                  key={option.score}
                  onClick={() => handleValueSelect(option.score)}
                  className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer text-base md:text-lg font-bold border-2`}
                  style={{ 
                    backgroundColor: option.color === "white" ? "white" : option.color,
                    borderColor: option.color === "white" ? "gray" : option.color,
                    color: option.color === "black" || option.color === "yellow" ? "black" : "black"
                  }}
                >
                  {option.score}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exibição da pontuação total */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-black">
                Pontuação total:&nbsp;
              </h2>
            <span className="text-xl md:text-2xl font-bold text-black">{total}</span>
          </div>

          <Button className="w-full bg-yellow-600 cursor-pointer hover:bg-yellow-700" onClick={handleSave}>
            Salvar Avaliação
          </Button>
        </div>
      </div>
    </div>
  )
}