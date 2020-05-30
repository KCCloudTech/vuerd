import { css } from "lit-element";

export const dragSelect = css`
  /* =============== dragSelect ============== */
  .vuerd-drag-select {
    position: fixed;
    z-index: 100000001;
    stroke: var(--vuerd-theme-focus, var(--vuerd-color-focus));
  }
`;
