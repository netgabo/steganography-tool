'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2, InfoIcon, CopyIcon, CheckIcon, UploadIcon, KeyIcon, DownloadIcon, ClipboardIcon, RefreshCwIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

const GoogleAd = () => (
  <div className="w-full h-[250px] bg-red-100 flex items-center justify-center border border-red-300 rounded-lg">
    <p className="text-red-500 font-semibold">Google Ad Placeholder</p>
  </div>
)

export function SteganographyTool() {
  const [image, setImage] = useState<string | null>(null)
  const [isModified, setIsModified] = useState<boolean>(false)
  const [decodedKey, setDecodedKey] = useState<string>('')
  const [generatedKey, setGeneratedKey] = useState<string>('')
  const [manualKey, setManualKey] = useState<string>('')
  const [decodeKey, setDecodeKey] = useState<string>('')
  const [useManualKey, setUseManualKey] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState<boolean>(false)
  const [showDownloadedTooltip, setShowDownloadedTooltip] = useState<boolean>(false)
  const [showKeyDownloadedTooltip, setShowKeyDownloadedTooltip] = useState<boolean>(false)
  const [decodeError, setDecodeError] = useState<string>('')
  const [decodeSuccess, setDecodeSuccess] = useState<boolean>(false)
  const [showResetModal, setShowResetModal] = useState<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        // El contexto está configurado con willReadFrequently = true
      }
    }

    const dropZone = dropZoneRef.current
    if (dropZone) {
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dropZone.classList.add('border-primary')
      }

      const handleDragLeave = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dropZone.classList.remove('border-primary')
      }

      const handleDrop = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dropZone.classList.remove('border-primary')
        if (e.dataTransfer?.files) {
          handleFiles(e.dataTransfer.files)
        }
      }

      dropZone.addEventListener('dragover', handleDragOver)
      dropZone.addEventListener('dragleave', handleDragLeave)
      dropZone.addEventListener('drop', handleDrop)

      return () => {
        dropZone.removeEventListener('dragover', handleDragOver)
        dropZone.removeEventListener('dragleave', handleDragLeave)
        dropZone.removeEventListener('drop', handleDrop)
      }
    }
  }, [])

  const generateRandomKey = useCallback((length: number = 32): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(byte => characters[byte % characters.length])
      .join('')
  }, [])

  const hideData = useCallback((imageData: ImageData, message: string) => {
    const data = imageData.data
    const messageBinary = message.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('')

    let dataIndex = 0
    for (let i = 0; i < messageBinary.length; i++) {
      const bit = parseInt(messageBinary[i])
      data[dataIndex] = (data[dataIndex] & 254) | bit
      dataIndex++
    }

    // Add terminator
    for (let i = 0; i < 8; i++) {
      data[dataIndex] = (data[dataIndex] & 254)
      dataIndex++
    }

    return imageData
  }, [])

  const extractData = useCallback((imageData: ImageData): string => {
    const data = imageData.data
    let binaryMessage = ''
    let byte = ''

    for (let i = 0; i < data.length; i++) {
      byte += (data[i] & 1).toString()
      if (byte.length === 8) {
        if (byte === '00000000') {
          break
        }
        binaryMessage += byte
        byte = ''
      }
    }

    return binaryMessage.match(/.{8}/g)?.map(byte => 
      String.fromCharCode(parseInt(byte, 2))
    ).join('') || ''
  }, [])

  const handleFiles = useCallback((files: FileList) => {
    const file = files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setIsModified(false)
        setDecodedKey('')
        setGeneratedKey('')
        setDecodeError('')
        setDecodeSuccess(false)
      }
      reader.readAsDataURL(file)
    } else {
      toast({
        title: "Error",
        description: "Por favor, seleccione un archivo de imagen válido.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleHideKey = useCallback(async () => {
    if (image && canvasRef.current) {
      setIsProcessing(true)
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        console.error('Unable to get 2D context')
        setIsProcessing(false)
        return
      }
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const keyToHide = useManualKey ? manualKey : generateRandomKey()
        setGeneratedKey(keyToHide)
        const modifiedImageData = hideData(imageData, keyToHide)
        ctx.putImageData(modifiedImageData, 0, 0)
        setImage(canvas.toDataURL())
        setIsModified(true)
        toast({
          title: "Key hidden successfully",
          description: "The key has been hidden in the image.",
          action: <ToastAction altText="Copy key">Copy key</ToastAction>,
        })
        setIsProcessing(false)
      }
      img.src = image
    }
  }, [image, useManualKey, manualKey, generateRandomKey, hideData, toast])

  const handleDecode = useCallback(() => {
    if (image && canvasRef.current) {
      setIsProcessing(true)
      setDecodeError('')
      setDecodeSuccess(false)
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        console.error('Unable to get 2D context')
        setIsProcessing(false)
        return
      }
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const extractedKey = extractData(imageData)
        if (extractedKey === decodeKey) {
          setDecodedKey(extractedKey)
          setDecodeSuccess(true)
          toast({
            title: "Decodificación exitosa",
            description: "La llave proporcionada coincide con la llave oculta en la imagen.",
            variant: "default",
          })
        } else {
          setDecodedKey('')
          setDecodeError('La llave proporcionada no coincide con la llave oculta en la imagen.')
          toast({
            title: "Error de decodificación",
            description: "La llave proporcionada no coincide con la llave oculta en la imagen.",
            variant: "destructive",
          })
        }
        setIsProcessing(false)
      }
      img.src = image
    }
  }, [image, decodeKey, extractData, toast])

  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key)
      setShowCopiedTooltip(true)
      setTimeout(() => {
        setShowCopiedTooltip(false)
        setCopiedKey(null)
      }, 2000)
    })
  }, [])

  const handleDownloadImage = useCallback(() => {
    if (image && isModified) {
      const link = document.createElement('a')
      link.href = image
      link.download = 'steganography_image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setShowDownloadedTooltip(true)
      setTimeout(() => {
        setShowDownloadedTooltip(false)
      }, 2000)
    }
  }, [image, isModified])

  const handlePasteKey = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setDecodeKey(text)
      toast({
        title: "Llave pegada",
        description: "La llave ha sido pegada desde el portapapeles.",
      })
    } catch (err) {
      toast({
        title: "Error al pegar",
        description: "No se pudo pegar desde el portapapeles. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleDownloadKey = useCallback(() => {
    if (generatedKey) {
      const blob = new Blob([generatedKey], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'key.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setShowKeyDownloadedTooltip(true)
      setTimeout(() => {
        setShowKeyDownloadedTooltip(false)
      }, 2000)
      toast({
        title: "Llave descargada",
        description: "La llave ha sido descargada como 'key.txt'.",
      })
    }
  }, [generatedKey, toast])

  const handleReset = useCallback(() => {
    setImage(null)
    setIsModified(false)
    setDecodedKey('')
    setGeneratedKey('')
    setDecodeError('')
    setDecodeSuccess(false)
    setManualKey('')
    setDecodeKey('')
    setShowResetModal(false)
  }, [])

  return (
    <TooltipProvider>
      <div className="flex flex-col space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Steganography Tool</h1>
        </div>
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="w-full lg:w-1/2 space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'encode' | 'decode')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="encode">Encode</TabsTrigger>
                <TabsTrigger value="decode">Decode</TabsTrigger>
              </TabsList>
              <TabsContent value="encode">
                <Card className="w-full">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="use-manual-key"
                        checked={useManualKey}
                        onCheckedChange={setUseManualKey}
                      />
                      <Label htmlFor="use-manual-key">Use manual key</Label>
                    </div>
                    {useManualKey && (
                      <div>
                        <Label htmlFor="manual-key" className="mb-2 block">Enter manual key</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="manual-key"
                            value={manualKey}
                            onChange={(e) => setManualKey(e.target.value)}
                            placeholder="Enter your key here"
                          />
                          <KeyIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    )}
                    <Button onClick={handleHideKey} disabled={isProcessing || isModified || !image} className="w-full">
                      {isProcessing ? 'Processing...' : `Hide ${useManualKey ? 'Manual' : 'Random'} Key`}
                    </Button>
                  </CardContent>
                </Card>
                {isModified && (
                  <Card className="mt-4">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex space-x-2">
                        <Tooltip open={showDownloadedTooltip}>
                          <TooltipTrigger asChild>
                            <Button onClick={handleDownloadImage} variant="outline" className="w-full">
                              <DownloadIcon className="mr-2 h-4 w-4" />
                              Download Image
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Imagen descargada</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                          Click the download button above to save the modified image with the hidden key.
                        </AlertDescription>
                      </Alert>
                      {generatedKey && (
                        <div className="w-full">
                          <Label htmlFor="generated-key" className="mb-2 block">Generated Key (Hidden in Image)</Label>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <Input
                              id="generated-key"
                              value={generatedKey}
                              readOnly
                              className="flex-grow"
                            />
                            <div className="flex space-x-2">
                              <Tooltip open={showCopiedTooltip && copiedKey === generatedKey}>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => handleCopyKey(generatedKey)}
                                    variant="outline"
                                    size="icon"
                                  >
                                    <CopyIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copiado</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip open={showKeyDownloadedTooltip}>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={handleDownloadKey}
                                    variant="outline"
                                    size="icon"
                                  >
                                    <DownloadIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Llave descargada</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="decode">
                <Card className="w-full">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="decode-key" className="mb-2 block">Enter key to decode</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="decode-key"
                          value={decodeKey}
                          onChange={(e) => setDecodeKey(e.target.value)}
                          placeholder="Enter the key to decode"
                        />
                        <Button onClick={handlePasteKey} variant="outline" size="icon">
                          <ClipboardIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleDecode} disabled={isProcessing || !image || !decodeKey} className="w-full">
                      {isProcessing ? 'Decoding...' : 'Decode Image'}
                    </Button>
                  </CardContent>
                </Card>
                {decodeSuccess && (
                  <Alert className="mt-4">
                    <CheckIcon className="h-4 w-4" />
                    <AlertDescription>
                      Decodificación exitosa. La llave proporcionada coincide con la llave oculta en la imagen.
                    </AlertDescription>
                  </Alert>
                )}
                {decodeError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{decodeError}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <Card className="w-full">
              <CardContent className="pt-6">
                <div
                  ref={dropZoneRef}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors duration-200"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {image ? (
                    <img src={image} alt="Uploaded" className="max-w-full h-auto mx-auto" />
                  ) : (
                    <div className="space-y-4">
                      <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex flex-col items-center">
                        <p className="text-xl font-semibold">Drag and drop your image here</p>
                        <p className="text-sm text-gray-500">or click to select a file</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
            {image && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Image Actions</h3>
                    <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <RefreshCwIcon className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure you want to reset?</DialogTitle>
                          <DialogDescription>
                            This action will clear the current image and all associated data. This cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowResetModal(false)}>Cancel</Button>
                          <Button variant="destructive" onClick={handleReset}>Reset</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <GoogleAd />
      </div>
    </TooltipProvider>
  )
}