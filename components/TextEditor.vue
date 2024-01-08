<template lang="pug">
.m-px
  .mb-3(v-if='editor && editable')
    el-button-group.mb-0(class='!flex')
      el-button.grow(
        :class='{ "is-active": editor.isActive("bold") }',
        @click='editor.chain().focus().toggleBold().run()'
      )
        strong Ж
      el-button.grow(
        :class='{ "is-active": editor.isActive("italic") }',
        @click='editor.chain().focus().toggleItalic().run()'
      )
        em К
      el-button.grow(
        :class='{ "is-active": editor.isActive("strike") }',
        @click='editor.chain().focus().toggleStrike().run()'
      )
        del del
      el-button.grow(
        :class='{ "is-active": editor.isActive("heading", { level: 1 }) }',
        @click='editor.chain().focus().toggleHeading({ level: 1 }).run()'
      )
        span.text-xl A
      el-button.grow(
        :class='{ "is-active": editor.isActive("heading", { level: 2 }) }',
        @click='editor.chain().focus().toggleHeading({ level: 2 }).run()'
      )
        span.text-base A
      el-button.grow(
        :class='{ "is-active": editor.isActive("heading", { level: 3 }) }',
        @click='editor.chain().focus().toggleHeading({ level: 3 }).run()'
      )
        span.text-sm A
    el-button-group.mb-3(class='!flex')
      el-button.grow(
        :class='{ "is-active": editor.isActive("bulletList") }',
        @click='editor.chain().focus().toggleBulletList().run()'
      )
        span.text-xs UL
      el-button.grow(
        :class='{ "is-active": editor.isActive("orderedList") }',
        @click='editor.chain().focus().toggleOrderedList().run()'
      )
        span.text-xs OL
      el-button.grow(
        :class='{ "is-active": editor.isActive("blockquote") }',
        @click='editor.chain().focus().toggleBlockquote().run()'
      )
        el-icon
          ElIconExpand
      el-button.grow(@click='editor.chain().focus().setHorizontalRule().run()')
        el-icon
          ElIconSemiSelect
  EditorContent(:editor='editor', :class='{ [target]: true, editable }')
</template>

<script setup lang="ts">
import { EditorContent, Editor } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'

const props = defineProps<{
  modelValue: string
  editable?: boolean
  target: 'grammar-notes'
}>()

const emit = defineEmits(['update:modelValue'])

const editor = ref<any>(null)

watchEffect(() => {
  if (!editor.value) return
  const isSame = editor.value.getHTML() === props.modelValue
  if (isSame) return

  editor.value.commands.setContent(props.modelValue, false)
})

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [StarterKit],
    onUpdate: () => emit('update:modelValue', editor.value.getHTML()),
    editable: props.editable,
  })
})
</script>

<style lang="scss">
.grammar-notes .ProseMirror {
  padding: 5px 10px;
  border-left: 1px solid dimgray;
}

.grammar-notes.editable .ProseMirror {
  padding: 5px 10px;
  outline: 1px solid #dcdfe6;
  border-radius: 3px;
  border: 0;
  transition: outline-color 0.2s ease-in-out;
}

.grammar-notes.editable .ProseMirror:hover {
  outline-color: darkgrey;
}

.grammar-notes.editable .ProseMirror-focused,
.grammar-notes.editable .ProseMirror:hover.ProseMirror-focused {
  outline-color: #409eff;
}

.grammar-notes .ProseMirror p {
  margin: 5px 0;
}

.grammar-notes .ProseMirror h1,
.grammar-notes .ProseMirror h2,
.grammar-notes .ProseMirror h3 {
  line-height: 1;
  margin: 16px 0;
  font-weight: 400;
}

.grammar-notes .ProseMirror h1 {
  font-size: 30px;
}

.grammar-notes .ProseMirror h2 {
  font-size: 24px;
}

.grammar-notes .ProseMirror h3 {
  font-size: 18px;
}

.grammar-notes .ProseMirror ul,
.grammar-notes .ProseMirror ol {
  margin: 10px 0;
  padding-left: 18px;
}

.grammar-notes .ProseMirror ul {
  list-style-type: disc;
}

.grammar-notes .ProseMirror ol {
  list-style-type: decimal;
}

.grammar-notes .ProseMirror blockquote {
  margin-left: 20px;
  padding-left: 10px;
  border-left: 3px solid dimgray;
}

.grammar-notes .ProseMirror hr {
  border: 0;
  border-top: 1px solid gray;
  margin: 10px 15px;
}
</style>
