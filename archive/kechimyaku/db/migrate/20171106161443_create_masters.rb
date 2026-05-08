class CreateMasters < ActiveRecord::Migration[5.1]

def up
  create_table :masters do |t|
    t.string :name
    t.string :name_native
    t.text :overview
  end
  create_table :relationships do |t|
    t.integer :parent_master_id
    t.integer :child_master_id
    t.integer :relationship_type_id
  end
  create_table :relationship_types do |t|
    t.string :name
  end
end

def down
  drop_table :masters
  drop_table :relationships
  drop_table :relationship_types
end

end
