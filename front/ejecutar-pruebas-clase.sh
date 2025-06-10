#!/bin/bash

echo "======================================"
echo "DEMOSTRACIÓN DE PRUEBAS AUTOMATIZADAS"
echo "Carnicería La Bendición"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Instalando dependencias...${NC}"
npm install

echo ""
echo -e "${BLUE}2. Ejecutando pruebas por módulo:${NC}"
echo ""

echo -e "${GREEN}► Pruebas de TipoPago${NC}"
npm run test:tipopago

echo ""
echo -e "${GREEN}► Pruebas de Categoría${NC}"
npm run test:categoria

echo ""
echo -e "${GREEN}► Pruebas de Comentario${NC}"
npm run test:comentario

echo ""
echo -e "${GREEN}► Pruebas de Registrar${NC}"
npm run test:registrar

echo ""
echo -e "${BLUE}3. Generando reporte de cobertura...${NC}"
npm run test:coverage

echo ""
echo -e "${GREEN}✓ Pruebas completadas!${NC}"
echo "Reporte de cobertura disponible en: coverage/lcov-report/index.html"