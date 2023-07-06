import React from "react";
import Link from "next/link";
import styles from "./NavBar.module.css";


const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <Link href="/" passHref>
        <img width="200px" padding-right="20px" src="https://thestonepot.azureedge.net/veggies/tradepod-beta.png" alt="Logo" />
      </Link>
    </nav>
  );
};

export default Navbar;
