<script lang="ts">
  /**
   * 共通ボタンコンポーネント
   */

  type ButtonVariant = 'primary' | 'danger' | 'cancel' | 'success';

  export let variant: ButtonVariant = 'primary';
  export let disabled: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button class="btn btn-{variant}" {disabled} {type} on:click>
  <slot />
</button>

<style>
  .btn {
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      opacity 0.2s ease;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn:focus-visible {
    outline: 2px solid var(--text-color);
    outline-offset: 2px;
  }

  /* Primary */
  .btn-primary {
    background-color: var(--btn-primary);
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--btn-primary-hover);
  }

  .btn-primary:active:not(:disabled) {
    background-color: var(--btn-primary-hover);
  }

  /* Danger */
  .btn-danger {
    background-color: var(--btn-danger);
  }

  .btn-danger:hover:not(:disabled) {
    background-color: var(--btn-danger-hover);
  }

  .btn-danger:active:not(:disabled) {
    background-color: var(--btn-danger-hover);
  }

  /* Cancel */
  .btn-cancel {
    background-color: var(--btn-cancel);
  }

  .btn-cancel:hover:not(:disabled) {
    background-color: var(--btn-cancel-hover);
  }

  .btn-cancel:active:not(:disabled) {
    background-color: var(--btn-cancel-hover);
  }

  /* Success */
  .btn-success {
    background-color: var(--btn-success);
  }

  .btn-success:hover:not(:disabled) {
    background-color: var(--btn-success-hover);
  }

  .btn-success:active:not(:disabled) {
    background-color: var(--btn-success-hover);
  }
</style>
