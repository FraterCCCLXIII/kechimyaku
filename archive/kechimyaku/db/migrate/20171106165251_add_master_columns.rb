class AddMasterColumns < ActiveRecord::Migration[5.1]
  def change
    add_column :masters, :year_born, :integer
    add_column :masters, :year_died, :integer
    add_column :masters, :gender, :string
    add_column :masters, :location, :string
  end
end
