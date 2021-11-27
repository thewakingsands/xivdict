<svelte:options accessors />

<script lang="ts">
  import type { SearchMatches } from './search/search.types'
  import '@thewakingsands/axis-font-icons'

  export let words: SearchMatches = []
  export let disableSpoilerWarning: boolean = false
  export let useRowStyle: boolean = false

  let showSpoilerWords: Set<string> = new Set()

  function showSpoiler(word: string) {
    showSpoilerWords.add(word)
    showSpoilerWords = showSpoilerWords
  }
</script>

<div class="Window" class:hidden={words.length < 1} class:Window-RowStyle={useRowStyle}>
  <div class="Window_Main">
    <ul class="Window_WordList">
      {#each words as word}
        <li class="Window_WordItem">
          <span class="Window_WordKey">{word.word}</span>
          <span class="Window_WordDefinition">
            {#if word.spoiler && !disableSpoilerWarning && !showSpoilerWords.has(word.word)}
              <span class="Window_SpoilerWarning">已隐藏含有剧透内容的词条</span>
              <span class="Window_SpoilerActions">
                <button on:click={() => showSpoiler(word.word)}>我要看</button>
                <button class="Window_SpoilerAction-Danger hidden">永久关闭剧透预警</button>
              </span>
            {:else}
              <span class="Window_WordDefinitionContent">
                {@html word.definition}
              </span>
            {/if}
          </span>
        </li>
      {/each}
    </ul>
    <div class="Window_Footer">
      <div class="Window_Functions">
        <button class="hidden">赞</button>
        <button class="hidden">反馈</button>
        <button class="hidden">不再显示</button>
      </div>
      <div class="Window_About">
        释义来自
        <a href="https://ff14.org/advanced/glossary.htm" rel="noopener" target="_blank">
          <ruby>新大陆见闻录<rt>«FF14豆芽站»</rt></ruby>
        </a>
      </div>
    </div>
  </div>
</div>

<style module lang="scss">
  .hidden {
    display: none !important;
  }
  @font-face {
    font-family: 'FFXIV';
    src: url('../assets/fonts/FFXIV_Lodestone_SSF.ttf') format('truetype'),
      url('../assets/fonts/FFXIV_Lodestone_SSF.woff') format('woff');
    unicode-range: U+E020-E0DB;
  }
  .Window {
    all: initial;
    user-select: inherit;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji';
    font-size: 14px;
    word-break: break-word;

    @apply block box-border;
    @apply text-gray-800;
    @apply border-8 border-solid border-gray-200 border-opacity-25 rounded-lg;
    @apply shadow-lg;

    @apply bg-gray-100;

    width: 340px;
    max-height: 800px;
    max-height: 90vh;
    overflow-y: auto;

    :global(button),
    :global(a) {
      @apply no-underline text-blue-500;
      &:hover {
        @apply text-blue-700;
      }
    }
    :global(button) {
      @apply border-none cursor-pointer p-0 m-0;
      user-select: none;
      background: transparent;
    }

    &_Main {
      @apply flex flex-col;
    }

    &_WordList {
      @apply flex-1;
      @apply list-none pl-0 mt-0 mb-0;

      :global(img) {
        @apply align-middle;
        height: 1em;
      }
    }
    &_WordItem {
      @apply flex py-1;
      &:nth-of-type(even) {
        @apply bg-gray-200;
      }
    }
    &_WordKey,
    &_WordDefinition {
      @apply mx-1;
    }
    &_WordKey {
      flex: 1;
      @apply text-red-800;
    }
    &_WordDefinition {
      flex: 3;
      :global(.WordRef) {
        @apply inline-block pr-1;
        &::after {
          content: '.';
        }
      }
      :global(ol) {
        @apply pl-0 list-none;
        counter-reset: listconter;
      }
      :global(ol li::before) {
        counter-increment: listconter;
        content: counter(listconter) '. ';
      }
    }
    &-RowStyle {
      .Window_WordItem {
        @apply flex-col;
      }
      .Window_WordKey {
        @apply font-bold;
      }
      .Window_WordDefinition {
        @apply mt-1;
      }
    }
    &_SpoilerWarning {
      @apply text-yellow-800;
    }
    &_SpoilerActions {
      @apply whitespace-nowrap;
      user-select: none;
    }
    &_SpoilerAction-Danger {
      @apply text-red-400;
      &:hover {
        @apply text-red-600;
      }
    }

    &_Footer {
      @apply flex items-end;
      @apply mt-2;
      @apply text-xs text-gray-500 text-right;
      ruby > rt {
        @apply text-xs text-center;
      }
    }
    &_Functions {
      user-select: none;
      button {
        @apply inline-block mr-1;
      }
    }
    &_About {
      @apply flex-1;
    }
  }
</style>
