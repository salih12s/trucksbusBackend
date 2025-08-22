#!/bin/bash

# Römork formlarını standart hale getirmek için script

FORMS=(
  "c:\\Users\\salih\\Desktop\\TruckBus\\Frontend\\src\\pages\\Forms\\TasimaRomorklari\\VasitaRomorkForm.tsx"
  "c:\\Users\\salih\\Desktop\\TruckBus\\Frontend\\src\\pages\\Forms\\TasimaRomorklari\\SeyehatRomorkForm.tsx"
  "c:\\Users\\salih\\Desktop\\TruckBus\\Frontend\\src\\pages\\Forms\\OzelAmacliRomork\\OzelAmacliRomorkForm.tsx"
  "c:\\Users\\salih\\Desktop\\TruckBus\\Frontend\\src\\pages\\Forms\\KamyonRomorklari\\KamyonRomorkFormm.tsx"
)

echo "Römork formları standardizasyon planı:"
for form in "${FORMS[@]}"; do
  echo "- $form"
done
