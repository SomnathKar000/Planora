// ────────────────────────────────────────────────────────────────
// Planora Domain — Enumerations
// ────────────────────────────────────────────────────────────────

/** The type of spatial project */
export enum ProjectType {
  Room = 'room',
  Apartment = 'apartment',
  House = 'house',
  Commercial = 'commercial',
}

/** Measurement unit for display purposes. Internal geometry is always in mm. */
export enum MeasurementUnit {
  Feet = 'feet',
  Meters = 'meters',
  Centimeters = 'centimeters',
}

/** Classification of a room's function */
export enum RoomType {
  LivingRoom = 'living_room',
  Bedroom = 'bedroom',
  Kitchen = 'kitchen',
  Bathroom = 'bathroom',
  DiningRoom = 'dining_room',
  HomeOffice = 'home_office',
  Balcony = 'balcony',
  Hallway = 'hallway',
  Closet = 'closet',
  Laundry = 'laundry',
  EntryHall = 'entry_hall',
  Storage = 'storage',
  Garage = 'garage',
  Custom = 'custom',
}

/** Interior design style */
export enum DesignStyle {
  Modern = 'modern',
  Minimal = 'minimal',
  Classic = 'classic',
  Industrial = 'industrial',
  Nordic = 'nordic',
  Custom = 'custom',
}

/** Furniture density preference */
export enum FurnitureDensity {
  Sparse = 'sparse',
  Balanced = 'balanced',
  Dense = 'dense',
}

/** Wall classification */
export enum WallType {
  Exterior = 'exterior',
  Interior = 'interior',
  Partition = 'partition',
}

/** Opening classification */
export enum OpeningType {
  Door = 'door',
  Window = 'window',
  Archway = 'archway',
}

/** Door swing direction */
export enum DoorSwing {
  Left = 'left',
  Right = 'right',
  Double = 'double',
  Sliding = 'sliding',
}

/** Common furniture categories */
export enum FurnitureType {
  Bed = 'bed',
  Sofa = 'sofa',
  DiningTable = 'dining_table',
  Desk = 'desk',
  Chair = 'chair',
  Wardrobe = 'wardrobe',
  Bookshelf = 'bookshelf',
  Toilet = 'toilet',
  Sink = 'sink',
  Bathtub = 'bathtub',
  Shower = 'shower',
  KitchenCounter = 'kitchen_counter',
  Refrigerator = 'refrigerator',
  Stove = 'stove',
  WashingMachine = 'washing_machine',
  Custom = 'custom',
}

/** Project workflow status */
export enum ProjectStatus {
  Draft = 'draft',
  InProgress = 'in_progress',
  ClientReview = 'client_review',
  StagingReady = 'staging_ready',
  Approved = 'approved',
  Complete = 'complete',
}
