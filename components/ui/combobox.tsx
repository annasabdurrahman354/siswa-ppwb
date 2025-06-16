"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ComboboxProps {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  label?: string
}

export function Combobox({ options, value, onChange, placeholder, disabled, label }: ComboboxProps) {
  const selected = options.find((opt) => opt.value === value)

  return (
    <div className="space-y-1">
      {label && <span className="text-sm font-medium">{label}</span>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn("w-full justify-between", !value && "text-muted-foreground")}
            disabled={disabled}
          >
            {selected ? selected.label : placeholder || "Pilih..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Cari..." className="h-9" />
            <CommandList>
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => onChange(option.value)}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
