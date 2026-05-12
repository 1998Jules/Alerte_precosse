#!/bin/bash

echo "🔍 Diagnostic du géoportail Django"
echo "=================================="

# Test 1: Vérifier si Django tourne
echo "1. Test de connexion à Django..."
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ Django est accessible sur http://localhost:8000"
else
    echo "❌ Django n'est pas accessible sur http://localhost:8000"
    echo "   Vérifiez que votre serveur Django est démarré avec :"
    echo "   python manage.py runserver 0.0.0.0:8000"
    exit 1
fi

# Test 2: Vérifier l'endpoint geoportail
echo ""
echo "2. Test de l'endpoint /geoportail/..."
response=$(curl -s -w "%{http_code}" http://localhost:8000/geoportail/ -o /dev/null)
if [ "$response" = "200" ]; then
    echo "✅ L'endpoint /geoportail/ répond"
else
    echo "❌ L'endpoint /geoportail/ ne répond pas (HTTP $response)"
    echo "   Vérifiez vos URLs dans geoportail/urls.py"
fi

# Test 3: Vérifier l'endpoint API layers
echo ""
echo "3. Test de l'endpoint /geoportail/api/layers/..."
response=$(curl -s -w "%{http_code}" http://localhost:8000/geoportail/api/layers/ -o /dev/null)
if [ "$response" = "200" ]; then
    echo "✅ L'endpoint /geoportail/api/layers/ répond"
    
    # Test 4: Vérifier le format de la réponse
    echo ""
    echo "4. Test du format de réponse..."
    response_body=$(curl -s http://localhost:8000/geoportail/api/layers/)
    
    if echo "$response_body" | grep -q '"success": true'; then
        echo "✅ La réponse contient 'success: true'"
        
        # Compter les couches
        layers_count=$(echo "$response_body" | grep -o '"[^"]*":' | grep -v "success\|layers\|total" | wc -l)
        echo "📊 Nombre de couches détectées : $layers_count"
        
        # Afficher un aperçu
        echo ""
        echo "📋 Aperçu de la réponse :"
        echo "$response_body" | head -20
        
    else
        echo "❌ La réponse n'a pas le format attendu"
        echo "   Réponse reçue :"
        echo "$response_body" | head -10
    fi
    
else
    echo "❌ L'endpoint /geoportail/api/layers/ ne répond pas (HTTP $response)"
    
    # Afficher l'erreur si disponible
    if [ "$response" != "000" ]; then
        echo "   Réponse d'erreur :"
        curl -s http://localhost:8000/geoportail/api/layers/ | head -10
    fi
fi

# Test 5: Vérifier CORS
echo ""
echo "5. Test des en-têtes CORS..."
cors_header=$(curl -s -I http://localhost:8000/geoportail/api/layers/ | grep -i "access-control-allow-origin" || echo "Non trouvé")
if [ "$cors_header" != "Non trouvé" ]; then
    echo "✅ En-tête CORS trouvé : $cors_header"
else
    echo "❌ En-tête CORS non trouvé"
    echo "   Vérifiez que corsheaders est bien configuré dans settings.py"
fi

echo ""
echo "🏁 Diagnostic terminé"