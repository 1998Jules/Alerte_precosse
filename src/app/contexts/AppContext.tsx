'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FieldData {
  id: string
  name: string
  culture: string
}

interface NdviPoint {
  date: string
  ndvi: number
}

interface AppContextType {
  // Données Météo (Globale ou Spécifique)
  weatherData: any
  setWeatherData: (data: any) => void
  
  // Champ Actuellement Sélectionné
  selectedField: FieldData | null
  setSelectedField: (field: FieldData | null) => void
  
  // Données NDVI (Indices de végétation)
  ndviData: NdviPoint[]
  setNdviData: (data: NdviPoint[]) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [weatherData, setWeatherData] = useState<any>(null)
  const [selectedField, setSelectedField] = useState<FieldData | null>(null)
  const [ndviData, setNdviData] = useState<NdviPoint[]>([])

  return (
    <AppContext.Provider value={{ 
      weatherData, 
      setWeatherData,
      selectedField,
      setSelectedField,
      ndviData,
      setNdviData
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}