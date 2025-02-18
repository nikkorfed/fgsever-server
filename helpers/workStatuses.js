exports.prepareWorkStatus = (item) => ({
  guid: item.Ref_Key,
  name: item.Description,
});
