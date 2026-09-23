// ─── ROOM REGISTRY ───────────────────────────────────────────────────────────
const ROOMS = {
  entrance: { name:'The Entrance Hall',    build:buildEntranceHall,    camPos:[0,1.7,0],     camYaw:Math.PI },
  living:   { name:'The Living Room',       build:buildLivingRoom,      camPos:[0,1.7,0],     camYaw:Math.PI },
  kitchen:  { name:'The Kitchen',          build:buildKitchen,         camPos:[0,1.7,0],     camYaw:Math.PI },
  library:  { name:'The Library',           build:buildLibrary,        camPos:[0,1.7,0],     camYaw:Math.PI },
  bathroom: { name:'The Bathroom',          build:buildBathroom,        camPos:[0,1.7,0],     camYaw:Math.PI },
  pantry:   { name:'The Pantry',            build:buildPantry,          camPos:[0,1.7,0],     camYaw:Math.PI },
  basement: { name:'The Basement',          build:buildBasement,        camPos:[0,1.7,0],     camYaw:Math.PI },
  attic:    { name:'The Attic',             build:buildAttic,           camPos:[0,1.7,0],     camYaw:Math.PI },
};
