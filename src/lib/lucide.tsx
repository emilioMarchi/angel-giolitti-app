'use client';

import { forwardRef } from 'react';

function withSSR(Component: any, displayName: string) {
  const Wrapped = forwardRef<any, any>((props, ref) => (
    <Component ref={ref} {...props} suppressHydrationWarning />
  ));
  Wrapped.displayName = displayName;
  return Wrapped;
}

import {
  Home as _Home,
  Search as _Search,
  Music2 as _Music2,
  FolderOpen as _FolderOpen,
  CalendarDays as _CalendarDays,
  Images as _Images,
  User as _User,
  Library as _Library,
  ChevronLeft as _ChevronLeft,
  ChevronRight as _ChevronRight,
  ChevronUp as _ChevronUp,
  ChevronDown as _ChevronDown,
  Play as _Play,
  Pause as _Pause,
  Shuffle as _Shuffle,
  Repeat as _Repeat,
  Heart as _Heart,
  MoreHorizontal as _MoreHorizontal,
  Clock as _Clock,
  Disc3 as _Disc3,
  Headphones as _Headphones,
  CheckCircle2 as _CheckCircle2,
  Users as _Users,
  Music as _Music,
  ArrowLeft as _ArrowLeft,
  ListMusic as _ListMusic,
  SkipBack as _SkipBack,
  SkipForward as _SkipForward,
  Volume2 as _Volume2,
  VolumeX as _VolumeX,
  Volume1 as _Volume1,
  Maximize2 as _Maximize2,
  X as _X,
  Disc as _Disc,
  FolderGit2 as _FolderGit2,
  Menu as _Menu,
  Calendar as _Calendar,
  MapPin as _MapPin,
  Ticket as _Ticket,
  ExternalLink as _ExternalLink,
  Camera as _Camera,
  FileText as _FileText,
  Download as _Download,
  MessageSquare as _MessageSquare,
  Send as _Send,
  Globe as _Globe,
  PlayCircle as _PlayCircle,
  Video as _Video,
  Clapperboard as _Clapperboard,
  Image as _Image,
  Share2 as _Share2,
  MessageCircle as _MessageCircle,
  Phone as _Phone,
} from 'lucide-react';

export const Home = withSSR(_Home, 'Home');
export const Search = withSSR(_Search, 'Search');
export const Music2 = withSSR(_Music2, 'Music2');
export const FolderOpen = withSSR(_FolderOpen, 'FolderOpen');
export const CalendarDays = withSSR(_CalendarDays, 'CalendarDays');
export const Images = withSSR(_Images, 'Images');
export const User = withSSR(_User, 'User');
export const Library = withSSR(_Library, 'Library');
export const ChevronLeft = withSSR(_ChevronLeft, 'ChevronLeft');
export const ChevronRight = withSSR(_ChevronRight, 'ChevronRight');
export const ChevronUp = withSSR(_ChevronUp, 'ChevronUp');
export const ChevronDown = withSSR(_ChevronDown, 'ChevronDown');
export const Play = withSSR(_Play, 'Play');
export const Pause = withSSR(_Pause, 'Pause');
export const Shuffle = withSSR(_Shuffle, 'Shuffle');
export const Repeat = withSSR(_Repeat, 'Repeat');
export const Heart = withSSR(_Heart, 'Heart');
export const MoreHorizontal = withSSR(_MoreHorizontal, 'MoreHorizontal');
export const Clock = withSSR(_Clock, 'Clock');
export const Disc3 = withSSR(_Disc3, 'Disc3');
export const Headphones = withSSR(_Headphones, 'Headphones');
export const CheckCircle2 = withSSR(_CheckCircle2, 'CheckCircle2');
export const Users = withSSR(_Users, 'Users');
export const Music = withSSR(_Music, 'Music');
export const ArrowLeft = withSSR(_ArrowLeft, 'ArrowLeft');
export const ListMusic = withSSR(_ListMusic, 'ListMusic');
export const SkipBack = withSSR(_SkipBack, 'SkipBack');
export const SkipForward = withSSR(_SkipForward, 'SkipForward');
export const Volume2 = withSSR(_Volume2, 'Volume2');
export const VolumeX = withSSR(_VolumeX, 'VolumeX');
export const Volume1 = withSSR(_Volume1, 'Volume1');
export const Maximize2 = withSSR(_Maximize2, 'Maximize2');
export const X = withSSR(_X, 'X');
export const Disc = withSSR(_Disc, 'Disc');
export const FolderGit2 = withSSR(_FolderGit2, 'FolderGit2');
export const Menu = withSSR(_Menu, 'Menu');
export const Calendar = withSSR(_Calendar, 'Calendar');
export const MapPin = withSSR(_MapPin, 'MapPin');
export const Ticket = withSSR(_Ticket, 'Ticket');
export const ExternalLink = withSSR(_ExternalLink, 'ExternalLink');
export const Camera = withSSR(_Camera, 'Camera');
export const FileText = withSSR(_FileText, 'FileText');
export const Download = withSSR(_Download, 'Download');
export const MessageSquare = withSSR(_MessageSquare, 'MessageSquare');
export const Send = withSSR(_Send, 'Send');
export const Globe = withSSR(_Globe, 'Globe');
export const PlayCircle = withSSR(_PlayCircle, 'PlayCircle');
export const Video = withSSR(_Video, 'Video');
export const Clapperboard = withSSR(_Clapperboard, 'Clapperboard');
export const Image = withSSR(_Image, 'Image');
export const Share2 = withSSR(_Share2, 'Share2');
export const MessageCircle = withSSR(_MessageCircle, 'MessageCircle');
export const Phone = withSSR(_Phone, 'Phone');
export const ImageIcon = Image;
