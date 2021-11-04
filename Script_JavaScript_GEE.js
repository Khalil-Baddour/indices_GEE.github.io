// 1-  Préparation des données

  // 1-1- Charger de la couche de contours de Bordeaux Métropole (roi)
var roi = ee.FeatureCollection("users/baddourkhalil/metropole_bordeaux"); // mais d'abord il faut le charger dans son compte google EE

  // 1-2 Séléction d'une collection d'images Landsat8 et filtrage
var L8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
      // Définition de la collection d'images
var collection = L8
.filterBounds(roi) //Filtrer avec la zone d'intérêt
.filterMetadata('CLOUD_COVER', 'less_than', 15) //Filtrer avec la couverture nuageuse
.sort('CLOUD_COVER') //Classer la collection
.filterDate("2021-06-01", "2021-09-30"); //Filtrer par date
      // Sélection d'une image dans la collection
var img = ee.Image(collection
.first()    // sélectionner la première image
.clip(roi)) //  la découper selon la région d'intérêt

// 2- Paramètres d'affichage
  // Centrer la carte
Map.setCenter(-0.5800364, 44.871225, 11);
  //Afficher la zone d'intérêt sur la carte
Map.addLayer(roi, {}, 'roi', false);
  // Affichage de l'image en fausses couleurs (PIR-R-V)
var faussesCouleurs = {
  "opacity":1,
  "bands":["SR_B5","SR_B4","SR_B3"],
  "min":7000,
  "max":12000
}
Map.addLayer(img, faussesCouleurs, 'mon image RVB');

// 3 - Calcul du NDVI (Normalised-Difference Vegetation Index)
  // le calcul du NDVI
var NDVI = img.expression(
  "(NIR - RED)/(NIR + RED)",
  {
    RED: img.select("SR_B4"),
    NIR: img.select("SR_B5")
  }).rename('NDVI');
  // Paramètres de visualisation du NDVI
var ndviViz = {
  "opacity" : 1,
  "min":0,
  "max":1,
  "palette" : ['black', 'yellow', 'green']
}
Map.addLayer(NDVI, ndviViz, 'NDVI'); //Ajout de la couche NDVI à la carte
// Calcul de la moyenne du NDVI de l'image
var ndvi_moyen = NDVI.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: roi,
  scale: 10
});
print(ndvi_moyen, 'NDVI moyen'); // Affichage du résultat dans la console

// 4 - Calcul du NDWI (Normalised-Difference Water Index)
  // le calcul du NDWI
var NDWI = img.expression(
  "(GREEN - NIR)/(GREEN + NIR)",
  {
    GREEN: img.select("SR_B3"),
    NIR: img.select("SR_B5")
  }).rename('NDWI');
// Paramètres de visualisation du NDWI
var ndwiViz = {
  "opacity" : 1,
  "min":-1,
  "max":0.5,
  "palette" : ['red', 'yellow', 'blue']
}
Map.addLayer(NDWI, ndwiViz, "NDWI"); //Ajout de la couche NDWI à la carte

// Calcul de la moyenne du NDWI de l'image
var ndwi_moyen = NDWI.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: roi,
  scale: 10
});

print(ndwi_moyen, 'NDWI moyen'); // Affichage du résultat dans la console

// 5- Export de l'image en spécifiant la résolution spatiale et la zone d'intérêt
Export.image.toDrive({
  image: NDWI,
  description: 'NDWI_Metropole-Bordeaux',
  scale: 10, // image resolution
  region: roi
});
