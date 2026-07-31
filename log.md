## Error Type
Build Error

## Error Message
Export Instagram doesn't exist in target module

## Build Output
./src/lib/lucide.tsx:13:1
Export Instagram doesn't exist in target module
  11 | }
  12 |
> 13 | import {
     | ^^^^^^^
> 14 |   Home as _Home,
     | ^^^^^^^^^^^^^^^^
> 15 |   Search as _Search,
     | ^^^^^^^^^^^^^^^^^^^^
> 16 |   Music2 as _Music2,
     | ^^^^^^^^^^^^^^^^^^^^
> 17 |   FolderOpen as _FolderOpen,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 18 |   CalendarDays as _CalendarDays,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 19 |   Images as _Images,
     | ^^^^^^^^^^^^^^^^^^^^
> 20 |   User as _User,
     | ^^^^^^^^^^^^^^^^
> 21 |   Library as _Library,
     | ^^^^^^^^^^^^^^^^^^^^^^
> 22 |   ChevronLeft as _ChevronLeft,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 23 |   ChevronRight as _ChevronRight,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 24 |   Play as _Play,
     | ^^^^^^^^^^^^^^^^
> 25 |   Pause as _Pause,
     | ^^^^^^^^^^^^^^^^^^
> 26 |   Shuffle as _Shuffle,
     | ^^^^^^^^^^^^^^^^^^^^^^
> 27 |   Repeat as _Repeat,
     | ^^^^^^^^^^^^^^^^^^^^
> 28 |   Heart as _Heart,
     | ^^^^^^^^^^^^^^^^^^
> 29 |   MoreHorizontal as _MoreHorizontal,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 30 |   Clock as _Clock,
     | ^^^^^^^^^^^^^^^^^^
> 31 |   Disc3 as _Disc3,
     | ^^^^^^^^^^^^^^^^^^
> 32 |   Headphones as _Headphones,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 33 |   CheckCircle2 as _CheckCircle2,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 34 |   Users as _Users,
     | ^^^^^^^^^^^^^^^^^^
> 35 |   Music as _Music,
     | ^^^^^^^^^^^^^^^^^^
> 36 |   ArrowLeft as _ArrowLeft,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 37 |   ListMusic as _ListMusic,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 38 |   SkipBack as _SkipBack,
     | ^^^^^^^^^^^^^^^^^^^^^^^^
> 39 |   SkipForward as _SkipForward,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 40 |   Volume2 as _Volume2,
     | ^^^^^^^^^^^^^^^^^^^^^^
> 41 |   VolumeX as _VolumeX,
     | ^^^^^^^^^^^^^^^^^^^^^^
> 42 |   Volume1 as _Volume1,
     | ^^^^^^^^^^^^^^^^^^^^^^
> 43 |   Maximize2 as _Maximize2,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 44 |   X as _X,
     | ^^^^^^^^^^
> 45 |   Disc as _Disc,
     | ^^^^^^^^^^^^^^^^
> 46 |   FolderGit2 as _FolderGit2,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 47 |   Menu as _Menu,
     | ^^^^^^^^^^^^^^^^
> 48 |   Calendar as _Calendar,
     | ^^^^^^^^^^^^^^^^^^^^^^^^
> 49 |   MapPin as _MapPin,
     | ^^^^^^^^^^^^^^^^^^^^
> 50 |   Ticket as _Ticket,
     | ^^^^^^^^^^^^^^^^^^^^
> 51 |   ExternalLink as _ExternalLink,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 52 |   Camera as _Camera,
     | ^^^^^^^^^^^^^^^^^^^^
> 53 |   FileText as _FileText,
     | ^^^^^^^^^^^^^^^^^^^^^^^^
> 54 |   Download as _Download,
     | ^^^^^^^^^^^^^^^^^^^^^^^^
> 55 |   MessageSquare as _MessageSquare,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 56 |   Send as _Send,
     | ^^^^^^^^^^^^^^^^
> 57 |   Globe as _Globe,
     | ^^^^^^^^^^^^^^^^^^
> 58 |   PlayCircle as _PlayCircle,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 59 |   Video as _Video,
     | ^^^^^^^^^^^^^^^^^^
> 60 |   Clapperboard as _Clapperboard,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 61 |   Image as _Image,
     | ^^^^^^^^^^^^^^^^^^
> 62 |   Share2 as _Share2,
     | ^^^^^^^^^^^^^^^^^^^^
> 63 |   MessageCircle as _MessageCircle,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 64 |   Phone as _Phone,
     | ^^^^^^^^^^^^^^^^^^
> 65 |   Instagram as _Instagram,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 66 |   Youtube as _Youtube,
     | ^^^^^^^^^^^^^^^^^^^^^^
> 67 | } from 'lucide-react';
     | ^^^^^^^^^^^^^^^^^^^^^^
  68 |
  69 | export const Home = withSSR(_Home, 'Home');
  70 | export const Search = withSSR(_Search, 'Search');

The export Instagram was not found in module [project]/node_modules/lucide-react/dist/esm/lucide-react.mjs [app-client] (ecmascript).
Did you mean to import Star?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  #1 [Client Component Browser]:
    ./src/lib/lucide.tsx [Client Component Browser]
    ./src/app/page.tsx [Client Component Browser]
    ./src/app/page.tsx [Server Component]

  #2 [Client Component SSR]:
    ./src/lib/lucide.tsx [Client Component SSR]
    ./src/app/page.tsx [Client Component SSR]
    ./src/app/page.tsx [Server Component]

  #3 [Client Component Browser]:
    ./src/lib/lucide.tsx [Client Component Browser]
    ./src/components/GlobalAudioPlayer.tsx [Client Component Browser]
    ./src/components/GlobalAudioPlayer.tsx [Server Component]
    ./src/app/layout.tsx [Server Component]

  #4 [Client Component SSR]:
    ./src/lib/lucide.tsx [Client Component SSR]
    ./src/components/GlobalAudioPlayer.tsx [Client Component SSR]
    ./src/components/GlobalAudioPlayer.tsx [Server Component]
    ./src/app/layout.tsx [Server Component]

Next.js version: 16.2.12 (Turbopack)
