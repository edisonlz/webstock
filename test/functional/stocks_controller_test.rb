require 'test_helper'

class StocksControllerTest < ActionController::TestCase
  def test_should_get_index
    get :index
    assert_response :success
    assert_not_nil assigns(:stocks)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end

  def test_should_create_stock
    assert_difference('Stock.count') do
      post :create, :stock => { }
    end

    assert_redirected_to stock_path(assigns(:stock))
  end

  def test_should_show_stock
    get :show, :id => stocks(:one).id
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => stocks(:one).id
    assert_response :success
  end

  def test_should_update_stock
    put :update, :id => stocks(:one).id, :stock => { }
    assert_redirected_to stock_path(assigns(:stock))
  end

  def test_should_destroy_stock
    assert_difference('Stock.count', -1) do
      delete :destroy, :id => stocks(:one).id
    end

    assert_redirected_to stocks_path
  end
end
