import {
  TableColumn,
  TableTemplateReferenceExpandableObject,
} from '../public/types';

export interface CustomData {
  age: number;
  email: string;
  homePlanet: string;
  id: number;
  lightsaberColor: 'Red' | 'Blue' | 'Green' | 'Purple' | null;
  name: string;
}

export type CustomDataExpandable = CustomData &
  Partial<{
    template: TableTemplateReferenceExpandableObject<{ data: CustomData }>;
  }>;

export const COLUMNS: ReadonlyArray<TableColumn<CustomData>> = [
  { key: 'id', label: 'ID' },
  { key: 'age', label: 'Age' },
  { key: 'name', label: 'Name' },
  { key: 'lightsaberColor', label: 'Lightsaber Color' },
  { key: 'homePlanet', label: 'Home Planet' },
  { key: 'email', label: 'Email' },
];

export const COLUMNS_EXPANDABLE: ReadonlyArray<
  TableColumn<CustomDataExpandable>
> = [
  ...COLUMNS,
  {
    key: 'template',
    label: 'Expandable',
    isSortable: false,
  } satisfies TableColumn<CustomDataExpandable>,
];

export const DATA: readonly CustomData[] = [
  {
    age: 19,
    email: 'luke@jedi.com',
    homePlanet: 'Tatooine',
    id: 1,
    lightsaberColor: 'Green',
    name: 'Luke Skywalker',
  },
  {
    age: 45,
    email: 'vader@sith.com',
    homePlanet: 'Tatooine',
    id: 2,
    lightsaberColor: 'Red',
    name: 'Darth Vader',
  },
  {
    age: 19,
    email: 'leia@jedi.com',
    homePlanet: 'Alderaan',
    id: 3,
    lightsaberColor: 'Blue',
    name: 'Leia Organa',
  },
  {
    age: 57,
    email: 'obiwan@jedi.com',
    homePlanet: 'Stewjon',
    id: 4,
    lightsaberColor: 'Blue',
    name: 'Obi-Wan Kenobi',
  },
  {
    age: 900,
    email: 'yoda@jedi.com',
    homePlanet: 'Dagobah',
    id: 5,
    lightsaberColor: 'Green',
    name: 'Yoda',
  },
  {
    age: 35,
    email: 'han@solo.com',
    homePlanet: 'Corellia',
    id: 6,
    lightsaberColor: null,
    name: 'Han Solo',
  },
  {
    age: 200,
    email: 'chewie@wookiee.com',
    id: 7,
    homePlanet: 'Kashyyyk',
    lightsaberColor: null,
    name: 'Chewbacca',
  },
  {
    age: 33,
    email: 'r2d2@jedi.com',
    homePlanet: 'Naboo',
    id: 8,
    lightsaberColor: null,
    name: 'R2-D2',
  },
  {
    age: 32,
    email: 'c3po@jedi.com',
    homePlanet: 'Tatooine',
    id: 9,
    lightsaberColor: null,
    name: 'C-3PO',
  },
  {
    age: 41,
    email: 'boba@fett.com',
    homePlanet: 'Kamino',
    id: 10,
    lightsaberColor: null,
    name: 'Boba Fett',
  },
  {
    age: 34,
    email: 'lando@rebels.com',
    homePlanet: 'Socorro',
    id: 11,
    lightsaberColor: null,
    name: 'Lando Calrissian',
  },
  {
    age: 82,
    email: 'palpatine@sith.com',
    homePlanet: 'Naboo',
    id: 12,
    lightsaberColor: null,
    name: 'Palpatine',
  },
  {
    age: 35,
    email: 'maul@sith.com',
    homePlanet: 'Dathomir',
    id: 13,
    lightsaberColor: 'Red',
    name: 'Darth Maul',
  },
  {
    age: 60,
    email: 'qui-gon@jedi.com',
    homePlanet: 'Coruscant',
    id: 14,
    lightsaberColor: 'Green',
    name: 'Qui-Gon Jinn',
  },
  {
    age: 53,
    email: 'mace@jedi.com',
    homePlanet: 'Haruun Kal',
    id: 15,
    lightsaberColor: 'Purple',
    name: 'Mace Windu',
  },
  {
    age: 27,
    email: 'padme@naboo.com',
    homePlanet: 'Naboo',
    id: 16,
    lightsaberColor: null,
    name: 'Padmé Amidala',
  },
  {
    age: 600,
    email: 'jabba@hutt.com',
    homePlanet: 'Nal Hutta',
    id: 17,
    lightsaberColor: null,
    name: 'Jabba the Hutt',
  },
  {
    age: 89,
    email: 'dooku@sith.com',
    homePlanet: 'Serenno',
    id: 18,
    lightsaberColor: null,
    name: 'Count Dooku',
  },
  {
    age: 70,
    email: 'grievous@sith.com',
    homePlanet: 'Kalee',
    id: 19,
    lightsaberColor: null,
    name: 'General Grievous',
  },
  {
    age: 19,
    email: 'rey@jedi.com',
    homePlanet: 'Jakku',
    id: 20,
    lightsaberColor: null,
    name: 'Rey',
  },
];
