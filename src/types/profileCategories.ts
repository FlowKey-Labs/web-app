export type Subcategory = {
  id: number;
  name: string;
  description?: string;
  category: number;
};

export type Skill = {
  id: number;
  name: string;
  subcategory: number;
  description?: string;
};

export type Category = {
  id: number;
  name: string;
  description?: string;
};