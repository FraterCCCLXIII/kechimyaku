class AddMasterRoot < ActiveRecord::Migration[5.1]
  def change
    add_column :masters, :is_root, :boolean
  end
end
