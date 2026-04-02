# Guía del Sistema de Diseño Semántico (DoReady)

¡Bienvenido al nuevo sistema de diseño unificado! Este documento describe cómo construir componentes para DoReady sin tener que preocuparte de escribir variables `dark:algo` en cada línea de código. 

Todo en la aplicación ahora está impulsado por variables semánticas inyectadas directamente en el núcleo de **Tailwind CSS v4** mediante `@theme` en `globals.css`.

## 🎨 Los Fundamentos

Ya no necesitas pensar en términos absolutos ("este texto es blanco en oscuro, gris en claro"). Piensa en el **PROPÓSITO** del elemento.

| Propósito | Tailwind Class a Usar | ¿Qué hace esto? |
| :--- | :--- | :--- |
| **Fondo Principal** | `bg-background` | Color de fondo de las páginas y la app. |
| **Fondo Contenedores**| `bg-surface` | Fondo para tarjetas, modales, menús y barras. |
| **Fondo Interactivo** | `bg-surface-hover` | Usado para efectos hover o botones flat suaves. |
| **Título Prominente** | `text-primary` | Texto absoluto (Negro en claro, Blanco en oscuro). |
| **Texto Descriptivo** | `text-secondary` | Textos apagados de relleno o sub-títulos. |
| **Bordes Universales**| `border-border` | Divisores que se adaptan suavemente. |
| **Elementos Marca** | `bg-accent` / `text-accent` | El elemento primario (Azul/Slate). |
| **Texto en Acento** | `text-on-accent` | Texto legible invertido dentro de elementos `bg-accent`. |

## ❌ Antes (Difícil de mantener)
```tsx
<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
    <h2 className="text-zinc-900 dark:text-zinc-50 font-bold">Título</h2>
    <p className="text-zinc-500 dark:text-zinc-400">Descripción del contenido...</p>
</div>
```

## ✅ Ahora (Automático y escalable)
```tsx
<div className="bg-surface border-border border p-4">
    <h2 className="text-primary font-bold">Título</h2>
    <p className="text-secondary">Descripción del contenido...</p>
</div>
```

*(Con este nuevo código de arriba, la card adaptará fondos, bordes y tipografías al modo perfecto en milisegundos sin lógica adicional).*

---

## ⚡ Estilos Inline y Legacy (`var(...)`)

Como parte de la actualización, los estilos antiguos seguirán funcionando perfectamente. Si te encuentras con algo como esto en un componente antiguo:
```tsx
<div style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
```
¡No lo borres inmediatamente! El nuevo sistema ha mantenido esos "alias" como medida de soporte. Sin embargo, para **nuevos componentes**, acostúmbrate a usar simplemente las clases estándar de Tailwind (`className="bg-surface"`).

## Opciones Avanzadas (La magia del color-mix)
Si quieres darle opacidad al fondo de la superficie, puedes combinar los nuevos tokens semánticos nativos de Tailwind. Ej:
```tsx
className="bg-surface/50 text-primary border-border"
```
Literalmente significa "Dale al fondo de la superficie un 50% de transparencia". Tailwind manejará automáticamente el color puro sin importar en qué tema estés.

¡A disfrutar programando menos y viéndolo mejor!
