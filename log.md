## Error Type
Console Error

## Error Message
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <HotReload globalError={[...]} webSocket={WebSocket} staticIndicatorState={{pathname:null, ...}}>
      <AppDevOverlayErrorBoundary globalError={[...]}>
        <ReplaySsrOnlyErrors>
        <DevRootHTTPAccessFallbackBoundary>
          <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
            <HTTPAccessFallbackErrorBoundary pathname="/" notFound={<NotAllowedRootHTTPFallbackError>} ...>
              <RedirectBoundary>
                <RedirectErrorBoundary router={{...}}>
                  <Head>
                  <__next_root_layout_boundary__>
                    <SegmentViewNode type="layout" pagePath="layout.tsx">
                      <SegmentTrieNode>
                      <link>
                      <script>
                      <script>
                      <script>
                      <script>
                      <script>
                      <script>
                      <RootLayout>
                        <html
                          lang="es"
                          className="inter_786c1081-module__J60SBq__variable outfit_2edbbf9e-module__Xf4ZLa__variable ..."
-                         data-darkreader-mode="dynamic"
-                         data-darkreader-scheme="dark"
-                         data-darkreader-proxy-injected="true"
                        >
                          <body className="spotify-la...">
                            <Sidebar>
                              <aside className="sidebar">
                                <div className="sidebar-block">
                                  <LinkComponent>
                                  <nav className="sidebar-nav">
                                    ...
                                      <a className="sidebar-li..." ref={function} onClick={function onClick} ...>
                                        <House className="sidebar-li...">
                                          <svg
                                            ref={null}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-house sidebar-link-icon"
                                            aria-hidden="true"
-                                           data-darkreader-inline-stroke=""
-                                           style={{--darkreader-inline-stroke:"currentColor"}}
                                          >
                                        ...
                                    ...
                                      <a className={"sidebar-..."} ref={function} onClick={function onClick} ...>
                                        <Search className="sidebar-li...">
                                          <svg
                                            ref={null}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-search sidebar-link-icon"
                                            aria-hidden="true"
-                                           data-darkreader-inline-stroke=""
-                                           style={{--darkreader-inline-stroke:"currentColor"}}
                                          >
                                        ...
                                <div className="sidebar-bl...">
                                  <div className="sidebar-li...">
                                    <div className="sidebar-li...">
                                      <Library className="h-5 w-5">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-library h-5 w-5"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                      ...
                                  <nav className="sidebar-nav">
                                    ...
                                      <a className={"sidebar-..."} ref={function} onClick={function onClick} ...>
                                        <Music2 className="sidebar-li...">
                                          <svg
                                            ref={null}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-music2 lucide-music-2 sidebar-link-icon"
                                            aria-hidden="true"
-                                           data-darkreader-inline-stroke=""
-                                           style={{--darkreader-inline-stroke:"currentColor"}}
                                          >
                                        ...
                                    ...
                                      <a className={"sidebar-..."} ref={function} onClick={function onClick} ...>
                                        <FolderOpen className="sidebar-li...">
                                          <svg
                                            ref={null}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-folder-open sidebar-link-icon"
                                            aria-hidden="true"
-                                           data-darkreader-inline-stroke=""
-                                           style={{--darkreader-inline-stroke:"currentColor"}}
                                          >
                                        ...
                                    ...
                                      <a className={"sidebar-..."} ref={function} onClick={function onClick} ...>
                                        <CalendarDays className="sidebar-li...">
                                          <svg
                                            ref={null}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-calendar-days sidebar-link-icon"
                                            aria-hidden="true"
-                                           data-darkreader-inline-stroke=""
-                                           style={{--darkreader-inline-stroke:"currentColor"}}
                                          >
                                        ...
                                    ...
                                      <a className={"sidebar-..."} ref={function} onClick={function onClick} ...>
                                        <Images className="sidebar-li...">
                                          <svg
                                            ref={null}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-images sidebar-link-icon"
                                            aria-hidden="true"
-                                           data-darkreader-inline-stroke=""
-                                           style={{--darkreader-inline-stroke:"currentColor"}}
                                          >
                                        ...
                                    ...
                                      <a className={"sidebar-..."} ref={function} onClick={function onClick} ...>
                                        <User className="sidebar-li...">
                                          <svg
                                            ref={null}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-user sidebar-link-icon"
                                            aria-hidden="true"
-                                           data-darkreader-inline-stroke=""
-                                           style={{--darkreader-inline-stroke:"currentColor"}}
                                          >
                                        ...
                            <main className="main-view">
                              <TopBar>
                                <header className="topbar">
                                  <LinkComponent>
                                  <div className="topbar-nav...">
                                    <button onClick={function onClick} className="topbar-nav..." aria-label="Atrás">
                                      <ChevronLeft className="h-4 w-4">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-chevron-left h-4 w-4"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                    <button onClick={function onClick} className="topbar-nav..." aria-label="Adelante">
                                      <ChevronRight className="h-4 w-4">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-chevron-right h-4 w-4"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                    ...
                                  <div>
                                  <button onClick={function onClick} className="topbar-nav..." aria-label="Abrir menú...">
                                    <Menu className="h-5 w-5">
                                      <svg
                                        ref={null}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-menu h-5 w-5"
                                        aria-hidden="true"
-                                       data-darkreader-inline-stroke=""
-                                       style={{--darkreader-inline-stroke:"currentColor"}}
                                      >
                                <div className="fixed inse..." onClick={function onClick} aria-hidden={true}>
                                  <div>
                                  <div className="absolute t..." style={{...}} onClick={function onClick}>
                                    <div className="flex items...">
                                      <span>
                                      <button onClick={function onClick} className="flex h-10 ..." ...>
                                        <X className="h-5 w-5">
                                          <svg
                                            ref={null}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-x h-5 w-5"
                                            aria-hidden="true"
-                                           data-darkreader-inline-stroke=""
-                                           style={{--darkreader-inline-stroke:"currentColor"}}
                                          >
                                    <nav className="flex-1 ove...">
                                      ...
                                        <a className="flex items..." ref={function} onClick={function onClick} ...>
                                          <User className="h-5 w-5 fl...">
                                            <svg
                                              ref={null}
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={24}
                                              height={24}
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="lucide lucide-user h-5 w-5 flex-shrink-0"
                                              aria-hidden="true"
-                                             data-darkreader-inline-stroke=""
-                                             style={{--darkreader-inline-stroke:"currentColor"}}
                                            >
                                          ...
                                      ...
                                        <a className="flex items..." ref={function} onClick={function onClick} ...>
                                          <Music className="h-5 w-5 fl...">
                                            <svg
                                              ref={null}
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={24}
                                              height={24}
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="lucide lucide-music h-5 w-5 flex-shrink-0"
                                              aria-hidden="true"
-                                             data-darkreader-inline-stroke=""
-                                             style={{--darkreader-inline-stroke:"currentColor"}}
                                            >
                                          ...
                                      ...
                                        <a className="flex items..." ref={function} onClick={function onClick} ...>
                                          <LayoutGrid className="h-5 w-5 fl...">
                                            <svg
                                              ref={null}
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={24}
                                              height={24}
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="lucide lucide-layout-grid h-5 w-5 flex-shrink-0"
                                              aria-hidden="true"
-                                             data-darkreader-inline-stroke=""
-                                             style={{--darkreader-inline-stroke:"currentColor"}}
                                            >
                                          ...
                                      ...
                                        <a className="flex items..." ref={function} onClick={function onClick} ...>
                                          <Calendar className="h-5 w-5 fl...">
                                            <svg
                                              ref={null}
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={24}
                                              height={24}
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="lucide lucide-calendar h-5 w-5 flex-shrink-0"
                                              aria-hidden="true"
-                                             data-darkreader-inline-stroke=""
-                                             style={{--darkreader-inline-stroke:"currentColor"}}
                                            >
                                          ...
                                      ...
                                        <a className="flex items..." ref={function} onClick={function onClick} ...>
                                          <Image className="h-5 w-5 fl...">
                                            <svg
                                              ref={null}
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={24}
                                              height={24}
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="lucide lucide-image h-5 w-5 flex-shrink-0"
                                              aria-hidden="true"
-                                             data-darkreader-inline-stroke=""
-                                             style={{--darkreader-inline-stroke:"currentColor"}}
                                            >
                                          ...
                                      ...
                                        <a className="flex items..." ref={function} onClick={function onClick} ...>
                                          <FileText className="h-5 w-5 fl...">
                                            <svg
                                              ref={null}
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={24}
                                              height={24}
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="lucide lucide-file-text h-5 w-5 flex-shrink-0"
                                              aria-hidden="true"
-                                             data-darkreader-inline-stroke=""
-                                             style={{--darkreader-inline-stroke:"currentColor"}}
                                            >
                                          ...
                                    ...
                              ...
                                <div className="artist-pro...">
                                  ...
                                    <div className="artist-her...">
                                      <div className="artist-ver...">
                                        <CircleCheck className="h-5 w-5 te...">
                                          <svg
                                            ref={null}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-circle-check h-5 w-5 text-primary"
                                            aria-hidden="true"
-                                           data-darkreader-inline-stroke=""
-                                           style={{--darkreader-inline-stroke:"currentColor"}}
                                          >
                                        ...
                                      <h1>
                                      <p className="artist-meta">
                                        <span className="artist-lis...">
                                          <Users className="h-4 w-4">
                                            <svg
                                              ref={null}
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={24}
                                              height={24}
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="lucide lucide-users h-4 w-4"
                                              aria-hidden="true"
-                                             data-darkreader-inline-stroke=""
-                                             style={{--darkreader-inline-stroke:"currentColor"}}
                                            >
                                          ...
                                  <div className="artist-act...">
                                    <button onClick={function handlePlayAll} className="artist-pla..." ...>
                                      <Play className="h-6 w-6" fill="currentColor">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-play h-6 w-6"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                    <button className="artist-shu..." aria-label="Aleatorio">
                                      <Shuffle className="h-5 w-5">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-shuffle h-5 w-5"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                    <button>
                                    <button className="artist-mor..." aria-label="Más opciones">
                                      <Ellipsis className="h-5 w-5">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-ellipsis h-5 w-5"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                  <section>
                                  <section>
                                  <section className="artist-sec...">
                                    <h2>
                                    <div className="home-quick...">
                                      <LinkComponent href="/proyectos" className="quick-acce...">
                                        <a className="quick-acce..." ref={function} onClick={function onClick} ...>
                                          <div
                                            className="quick-access-icon"
                                            style={{
+                                             background: "var(--accent-blue)"
-                                             background-image: ""
-                                             background-position-x: ""
-                                             background-position-y: ""
-                                             background-size: ""
-                                             background-repeat: ""
-                                             background-attachment: ""
-                                             background-origin: ""
-                                             background-clip: ""
-                                             background-color: ""
-                                             --darkreader-inline-bg: "var(--darkreader-bg--accent-blue)"
                                            }}
-                                           data-darkreader-inline-bg=""
                                          >
                                            <Clapperboard className="h-5 w-5 te...">
                                              <svg
                                                ref={null}
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-clapperboard h-5 w-5 text-white"
                                                aria-hidden="true"
-                                               data-darkreader-inline-stroke=""
-                                               style={{--darkreader-inline-stroke:"currentColor"}}
                                              >
                                          ...
                                      <LinkComponent href="/galeria" className="quick-acce...">
                                        <a className="quick-acce..." ref={function} onClick={function onClick} ...>
                                          <div
                                            className="quick-access-icon"
                                            style={{
+                                             background: "var(--accent-orange)"
-                                             background-image: ""
-                                             background-position-x: ""
-                                             background-position-y: ""
-                                             background-size: ""
-                                             background-repeat: ""
-                                             background-attachment: ""
-                                             background-origin: ""
-                                             background-clip: ""
-                                             background-color: ""
-                                             --darkreader-inline-bg: "var(--darkreader-bg--accent-orange)"
                                            }}
-                                           data-darkreader-inline-bg=""
                                          >
                                            <Images className="h-5 w-5 te...">
                                              <svg
                                                ref={null}
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-images h-5 w-5 text-white"
                                                aria-hidden="true"
-                                               data-darkreader-inline-stroke=""
-                                               style={{--darkreader-inline-stroke:"currentColor"}}
                                              >
                                          ...
                                      <LinkComponent href="/bio" className="quick-acce...">
                                        <a className="quick-acce..." ref={function} onClick={function onClick} ...>
                                          <div
                                            className="quick-access-icon"
                                            style={{
+                                             background: "var(--accent-pink)"
-                                             background-image: ""
-                                             background-position-x: ""
-                                             background-position-y: ""
-                                             background-size: ""
-                                             background-repeat: ""
-                                             background-attachment: ""
-                                             background-origin: ""
-                                             background-clip: ""
-                                             background-color: ""
-                                             --darkreader-inline-bg: "var(--darkreader-bg--accent-pink)"
                                            }}
-                                           data-darkreader-inline-bg=""
                                          >
                                            <User className="h-5 w-5 te...">
                                              <svg
                                                ref={null}
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-user h-5 w-5 text-white"
                                                aria-hidden="true"
-                                               data-darkreader-inline-stroke=""
-                                               style={{--darkreader-inline-stroke:"currentColor"}}
                                              >
                                          ...
                                  ...
                            <GlobalAudioPlayer>
                              <audio>
                              <footer className="player-bar">
                                <div>
                                <div className="player-con...">
                                  <div className="player-con...">
                                    <button className="player-con..." aria-label="Aleatorio">
                                      <Shuffle className="h-4 w-4">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-shuffle h-4 w-4"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                    <button onClick={function previousTrack} disabled={true} className="player-con..." ...>
                                      <SkipBack className="h-4 w-4" fill="currentColor">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-skip-back h-4 w-4"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                    <button onClick={function togglePlay} className="player-pla..." ...>
                                      <Play className="h-5 w-5 tr..." fill="currentColor">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-play h-5 w-5 translate-x-[1px]"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                    <button onClick={function nextTrack} disabled={true} className="player-con..." ...>
                                      <SkipForward className="h-4 w-4" fill="currentColor">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-skip-forward h-4 w-4"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                    <button className="player-con..." aria-label="Repetir">
                                      <Repeat className="h-4 w-4">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-repeat h-4 w-4"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                  ...
                                <div className="player-con...">
                                  <button className="player-con..." aria-label="Cola de re...">
                                    <ListMusic className="h-4 w-4">
                                      <svg
                                        ref={null}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-list-music h-4 w-4"
                                        aria-hidden="true"
-                                       data-darkreader-inline-stroke=""
-                                       style={{--darkreader-inline-stroke:"currentColor"}}
                                      >
                                  <div className="player-vol...">
                                    <button onClick={function toggleMute} className="player-con..." ...>
                                      <Volume2 className="h-4 w-4">
                                        <svg
                                          ref={null}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide lucide-volume2 lucide-volume-2 h-4 w-4"
                                          aria-hidden="true"
-                                         data-darkreader-inline-stroke=""
-                                         style={{--darkreader-inline-stroke:"currentColor"}}
                                        >
                                    ...
                                  <button className="player-con..." aria-label="Pantalla c...">
                                    <Maximize2 className="h-4 w-4">
                                      <svg
                                        ref={null}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-maximize2 lucide-maximize-2 h-4 w-4"
                                        aria-hidden="true"
-                                       data-darkreader-inline-stroke=""
-                                       style={{--darkreader-inline-stroke:"currentColor"}}
                                      >
                  ...



    at svg (<anonymous>:null:null)
    at <unknown> (src/components/Sidebar.tsx:59:17)
    at Array.map (<anonymous>:null:null)
    at Sidebar (src/components/Sidebar.tsx:51:20)
    at RootLayout (src\app\layout.tsx:40:9)

## Code Frame
  57 |                 className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
  58 |               >
> 59 |                 <Icon className="sidebar-link-icon" />
     |                 ^
  60 |                 <span>{item.label}</span>
  61 |               </Link>
  62 |             );

Next.js version: 16.2.11 (Turbopack)
