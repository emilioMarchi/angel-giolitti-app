| album_title                | release_year | project_id                           | project_title             | project_creation | project_end |
| -------------------------- | ------------ | ------------------------------------ | ------------------------- | ---------------- | ----------- |
| The Alan Person Experience | 2018         | 64db4321-736b-4861-91c3-734ea9d59c49 | The Alan Person Experiens | 2018             | null        |
| Handangel                  | 2018         | 2afbaacb-44ec-4c2b-9f34-d2f1e81e7040 | Handangel                 | 2017             | 2026        |
| Fruttyazz                  | 2017         | 6f8faf9c-9ff9-4121-9c81-939bc15360c4 | Fruttyazz                 | 2017             | null        |
| Los Charlys Live           | 2010         | bee83983-6c41-4d39-a25e-18db0c09cd5e | Los Charlys del Angel     | 2010             | null        |
| BPA en vivo - Picasso bar  | 2006         | 6b510518-6111-46bc-ae35-b7d753cdf0a8 | Bajo Percusión Armónica   | 2005             | 2006        |
| BPA en vivo - Programa 13  | 2005         | 6b510518-6111-46bc-ae35-b7d753cdf0a8 | Bajo Percusión Armónica   | 2005             | 2006        |
| Amokyneti                  | 2003         | 6870f086-b5b6-4b95-ae45-810623b62c44 | Amokyneti                 | 2003             | null        |
| Cebu                       | 1999         | f1bc49d8-f267-4591-8b2b-50d0233ecfaa | Cebu                      | 1997             | null        |
| Tarahumaras                | 1999         | 5aead99b-cbf0-4375-b91a-acb971c8fc85 | Tarahumaras               | 1999             | null        |

---

## Setear categoría 'actual' en proyectos
Ejecutar en Supabase → SQL Editor:
```sql
-- Ver categorías actuales
SELECT title, category FROM projects;

-- Setear Handangel como 'actual'
UPDATE projects SET category = 'actual' WHERE slug = 'handangel';
```