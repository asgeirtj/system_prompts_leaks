methods: {
  handleRecordChange() {
    this.$forceUpdate();
  },
  // existing methods
},
mounted() {
  this.$store.subscribe((mutation, state) => {
    if (mutation.type === 'insertRecord') {
      this.handleRecordChange();
    }
  });
}