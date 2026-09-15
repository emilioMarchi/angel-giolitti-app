## Error Type
Console Error

## Error Message
Error saving event: {}


    at handleSaveEvent (src/components/admin/AdminEventos.tsx:285:15)

## Code Frame
  283 |       setView('list');
  284 |     } catch (err: any) {
> 285 |       console.error('Error saving event:', err);
      |               ^
  286 |       setErrorMessage(err.message || 'Error al guardar el evento.');
  287 |     } finally {
  288 |       setSaving(false);

Next.js version: 16.2.12 (Turbopack)
