import { invoke } from "@tauri-apps/api/core";

// Defines the structure of a product object used in the frontend
export interface Product {
  id: number;
  goods_name: string;
  goods_type: string;
  price: number;
  stock: number;
}

// Defines the data structure for updating product information via the API.
// Matches the `UpdateGoodsData` struct in the Rust backend.
export interface UpdateProductData {
  stock?: number; // Optional: new stock quantity
  price?: number; // Optional: new price
}

export interface AddProductData {
  goods_name: string;
  goods_type?: string; // Optional, as in Rust
  price: number;
  stock?: number;      // Optional, as in Rust
}

/**
 * Fetches all products from the backend.
 * @returns A promise that resolves to an array of Product objects.
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const products = await invoke<Product[]>("get_all_goods");
    console.log("Fetched products:", products);
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    // Consider re-throwing the error or returning a more specific error object
    // instead of an empty array if the caller needs to handle it differently.
    return [];
  }
};

/**
 * Updates the information (stock and/or price) of a specific product on the backend.
 * @param goodsId The ID of the product to update.
 * @param data An object containing the product fields to update (e.g., stock, price).
 * @returns A promise that resolves with a success message string from the backend
 *          or rejects with an error if the update fails.
 */
export const AdminUpdateProduct = async (
  goodsId: number,
  data: UpdateProductData
): Promise<string> => {
  try {
    // Construct the payload to match the Rust function's arguments.
    // The Rust command `update_goods_info` expects `goods_id` and `data`.
    const payload = {
      goodsId: goodsId,
      data: data, // `data` here directly matches the `UpdateGoodsData` Rust struct
    };

    // Backend already checks if data is empty, but good to be aware.
    // if (Object.keys(data).length === 0) {
    //   return "No details provided to update.";
    // }

    const result = await invoke<string>("update_goods_info", payload);
    console.log(`Product ${goodsId} update result:`, result);
    return result; // Return the success message from the backend
  } catch (error) {
    console.error(`Failed to update product ${goodsId}:`, error);
    // Standardize error throwing to ensure consistency for the caller
    if (typeof error === 'string') {
      throw new Error(error);
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unknown error occurred while updating the product.");
    }
  }
};

/**
 * Adds a new product to the backend.
 * @param data An object containing the new product's details.
 * @returns A promise that resolves with a success message string from the backend
 *          or rejects with an error if the addition fails.
 */
export const addProduct = async (data: AddProductData): Promise<string> => {
  try {
    // The Rust command `add_goods` expects `data` as its argument.
    const result = await invoke<string>("add_goods", { data });
    console.log(`Add product result:`, result);
    return result; // Return the success message from the backend
  } catch (error) {
    console.error(`Failed to add product:`, error);
    // Standardize error throwing to ensure consistency for the caller
    if (typeof error === 'string') {
      throw new Error(error);
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unknown error occurred while adding the product.");
    }
  }
};