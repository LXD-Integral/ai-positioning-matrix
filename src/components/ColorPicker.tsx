'use client'

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(event.target.value)
  }

  return (
    <div className="input-group">
      <label htmlFor="userColor" className="block mb-2 text-[#495057] font-medium">
        Pick a color to display your results:
      </label>
      <input
        type="color"
        id="userColor"
        value={selectedColor}
        onChange={handleColorChange}
        className="w-[60px] h-[40px] border-2 border-[#dee2e6] rounded-lg cursor-pointer"
      />
    </div>
  )
}