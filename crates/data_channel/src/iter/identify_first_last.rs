use std::{ iter, mem };
pub trait IdentifyFirstLast: Iterator + Sized {
    fn identify_first_last(self) -> IdentifyFirstLastIter<Self>;
}

impl<I> IdentifyFirstLast for I where I: Iterator {
    fn identify_first_last(self) -> IdentifyFirstLastIter<Self> {
        IdentifyFirstLastIter(true, self.peekable())
    }
}

pub struct IdentifyFirstLastIter<I>(bool, iter::Peekable<I>) where I: Iterator;

impl<I> Iterator for IdentifyFirstLastIter<I> where I: Iterator {
    type Item = (bool, bool, I::Item);

    fn next(&mut self) -> Option<Self::Item> {
        let first = mem::replace(&mut self.0, false);
        self.1.next().map(|e| (first, self.1.peek().is_none(), e))
    }
}
