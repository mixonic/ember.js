var INFINITY = Infinity;

function SkipListNode(key, value){
  this.key = key;
  this.value = value;
  this.forward = [];
}

function SkipList(maxLevel){
  this.maxLevel = maxLevel;
  this.header = new SkipListNode(null);
  var sentinel = new SkipListNode(INFINITY);
  for (var i=0; i <= maxLevel; i++) {
    this.header.forward[i] = sentinel;
  }
}

SkipList.prototype._findNode = function(key){
  var next, current = this.header;

  for (var i=this.maxLevel; i >= 0; i--) {
    next = current.forward[i];
    while (next && next.key <= key) {
      current = next;
      next = current.forward[i];
    }
  }

  return current;
};

SkipList.prototype.find = function(key){
  var node = this._findNode(key);
  if (node.key === key) return node.value;
  else return null;
};

SkipList.prototype.add = function(key, value){
  var node = this._findNode(key);
  if (node.key === key) throw("Added a key already present");
  var after = node.forward,
      newNode = new SkipListNode(key, value);
  newNode.forward = after;
  node.forward = [newNode];
  var newLevel = 0;
  while (newLevel < this.maxLevel && Math.random() < 0.5) {
    node.forward.push(newNode);
    newLevel++;
  }
};

SkipList.prototype.remove = function(key){
  var node = this._findNode(key-1);
  if (node.forward[0].key !== key) throw("Key not found");
  for (var i=0;i<node.forward.length;i++){
    node.forward[i] = node.forward[0].forward[0];
  }
};

Ember.SkipList = SkipList;
